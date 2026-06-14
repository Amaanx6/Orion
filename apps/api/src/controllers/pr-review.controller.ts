import { Request, Response } from "express";
import { db, prReviews } from "@repo/db";
import { eq, and, desc, SQL } from "drizzle-orm";

// GET /api/v1/pr-reviews
export const getPRReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo, pr, prNumber } = req.query;

    const conditions: SQL[] = [];

    if (owner) {
      conditions.push(eq(prReviews.owner, String(owner)));
    }
    if (repo) {
      conditions.push(eq(prReviews.repo, String(repo)));
    }

    const prVal = prNumber || pr;
    if (prVal) {
      const parsedPr = parseInt(String(prVal), 10);
      if (!isNaN(parsedPr)) {
        conditions.push(eq(prReviews.prNumber, parsedPr));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(prReviews)
      .where(where)
      .orderBy(desc(prReviews.createdAt));

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("[pr-review-controller] failed to get PR reviews:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};

// GET /api/v1/pr-reviews/:id
export const getPRReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params["id"]);
    const [review] = await db
      .select()
      .from(prReviews)
      .where(eq(prReviews.id, id))
      .limit(1);

    if (!review) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "PR Review not found" } });
      return;
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error("[pr-review-controller] failed to get PR review by ID:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};
