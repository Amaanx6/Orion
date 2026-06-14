import { Request, Response } from "express";
import crypto from "crypto";
import {
  db,
  connectedRepos,
  runs,
  findings,
  agentResults,
  eq,
  and,
} from "@repo/db";
import { runAgents } from "@repo/agents";
import { nanoid } from "nanoid";
import {
  postPendingStatus,
  postCompletedStatus,
  postPRComment,
  postInlineComments,
} from "../services/github.service";

// ─── Verify GitHub Signature ──────────────────────────────────────────────────
// req.body is a raw Buffer here (express.raw middleware in app.ts).
// We MUST sign the raw bytes — not JSON.stringify(parsedObject) — because
// GitHub signs the exact bytes it sent, and re-serialising a parsed object
// can differ in whitespace / key order.

function verifySignature(req: Request): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const signature = req.headers["x-hub-signature-256"] as string;
  if (!signature) return false;

  const rawBody = req.body as Buffer;
  if (!Buffer.isBuffer(rawBody)) {
    console.error("[webhook] req.body is not a Buffer — check middleware order in app.ts");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export const handleGithubWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!verifySignature(req)) {
    console.warn("[webhook] signature verification failed");
    res.status(401).json({ success: false, error: "Invalid signature" });
    return;
  }

  // Parse the raw buffer into an object now that signature is verified
  let payload: any;
  try {
    payload = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    res.status(400).json({ success: false, error: "Invalid JSON body" });
    return;
  }

  const event = req.headers["x-github-event"] as string;

  console.log(`[webhook] received event: ${event}, action: ${payload.action ?? "n/a"}`);

  // ── Installation event — save repos to DB ─────────────────────────────────
  if (event === "installation" && payload.action === "created") {
    const { installation, repositories } = payload;

    for (const repo of repositories ?? []) {
      await db
        .insert(connectedRepos)
        .values({
          owner: installation.account.login,
          repo: repo.name,
          installationId: String(installation.id),
          stagingUrl: "",
        })
        .onConflictDoNothing();
    }

    console.log(`[webhook] installation created — saved ${repositories?.length ?? 0} repo(s)`);
    res.status(200).json({ success: true });
    return;
  }

  // ── Installation deleted — mark repos as disconnected ─────────────────────
  if (event === "installation" && payload.action === "deleted") {
    const { installation } = payload;

    await db
      .delete(connectedRepos)
      .where(eq(connectedRepos.installationId, String(installation.id)));

    console.log(`[webhook] installation deleted — removed repos for installation ${installation.id}`);
    res.status(200).json({ success: true });
    return;
  }

  // ── Pull Request event — trigger QA run ──────────────────────────────────
  if (
    event === "pull_request" &&
    ["opened", "synchronize"].includes(payload.action)
  ) {
    const { pull_request, repository, installation } = payload;

    const owner = repository.owner.login;
    const repo = repository.name;
    const sha = pull_request.head.sha;
    const prNumber = pull_request.number;
    const branch = pull_request.head.ref;
    const installationId = String(installation.id);

    console.log(`[webhook] PR #${prNumber} ${payload.action} on ${owner}/${repo} @ ${sha}`);

    // Look up staging URL from DB
    const connected = await db.query.connectedRepos.findFirst({
      where: eq(connectedRepos.repo, repo),
    });

    if (!connected?.stagingUrl) {
      console.warn(`[webhook] no staging URL configured for ${owner}/${repo} — skipping run`);
      res.status(200).json({ success: true, skipped: true, reason: "no staging URL" });
      return;
    }

    const runId = `run_${nanoid(6)}`;

    // Insert run into DB
    const [newRun] = await db
      .insert(runs)
      .values({
        runId,
        url: connected.stagingUrl,
        mode: "ci",
        status: "queued",
        ciContext: {
          pr: prNumber,
          sha,
          branch,
          repo,
          owner,
        },
      })
      .returning();

    console.log(`[webhook] created run ${runId} for ${connected.stagingUrl}`);

    // Post pending status immediately so the PR shows a check right away
    await postPendingStatus(owner, repo, sha, installationId);

    // Respond to GitHub immediately — do NOT await the agents
    // GitHub expects a response within 10 seconds or it marks the delivery failed
    res.status(200).json({ success: true, runId });

    // Run agents in background
    runAgents(newRun!.runId, newRun!.id, connected.stagingUrl, "ci")
      .then(async () => {
        // Fetch completed run
        const run = await db.query.runs.findFirst({
          where: eq(runs.runId, runId),
        });

        const score = run?.overallScore ?? 0;
        const passed = run?.passed ?? false;

        // Fetch findings
        const runFindings = run
          ? await db.query.findings.findMany({
              where: eq(findings.runId, run.id),
            })
          : [];

        const findingsCount = runFindings.length;

        // Fetch rootCause from scoring agent result
        let rootCause: string | undefined;
        if (run) {
          const scoringResult = await db.query.agentResults.findFirst({
            where: and(
              eq(agentResults.runId, run.id),
              eq(agentResults.agent, "scoring")
            ),
          });
          const data = scoringResult?.data as { rootCause?: string } | null;
          rootCause = data?.rootCause ?? undefined;
        }

        // Post results back to GitHub
        await postCompletedStatus(owner, repo, sha, installationId, score, passed, runId);
        await postPRComment(owner, repo, prNumber, installationId, score, passed, runId, findingsCount, rootCause);

        if (runFindings.length > 0) {
          await postInlineComments(
            owner,
            repo,
            prNumber,
            installationId,
            sha,
            runFindings.map((f) => ({
              ...f,
              file: f.file ?? undefined,
              line: f.line ?? undefined,
              fixSuggestion: f.fixSuggestion ?? undefined,
              nodeId: f.nodeId ?? undefined,
            }))
          );
        }

        console.log(`[webhook] run ${runId} complete — score: ${score}/100, passed: ${passed}`);
      })
      .catch(async (err) => {
        console.error(`[webhook] run ${runId} failed:`, err);
        // Post failure status so the PR check doesn't hang on pending
        await postCompletedStatus(owner, repo, sha, installationId, 0, false, runId);
      });

    return;
  }

  // ── All other events ──────────────────────────────────────────────────────
  res.status(200).json({ success: true });
};