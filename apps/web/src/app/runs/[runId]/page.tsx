'use client'

import { useState } from 'react'
import Link from 'next/link'

import { DashboardShell } from '../../../components/shell/dashboard-shell'
import { Button } from '@/components/ui/button'

import { useRunDetail } from '../../../lib/hooks'

import { ScoreRing } from '../../../components/status/score-ring'
import {
  StatusBadge,
  SeverityBadge,
} from '../../../components/status/status-badge'

import {
  formatDate,
  formatDuration,
  truncate,
} from '../../../lib/utils'

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

interface Finding {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  location?: string
  codeSnippet?: string
  suggestedFix?: string
  autoFixable?: boolean
}

interface PipelineStage {
  name: string
  status: 'completed' | 'running' | 'pending' | 'error'
  duration?: number
}

interface RunDetail {
  id: string
  url: string
  status: 'completed' | 'running' | 'failed'
  mode: 'manual' | 'ci'
  createdAt: string
  duration?: number
  score?: number
  findings?: Finding[]
  pipelineStages?: PipelineStage[]
}

interface PageProps {
  params: Promise<{ runId: string }>
}

export default function RunDetailPage({
  params,
}: PageProps) {
  const [runId, setRunId] = useState<string | null>(
    null
  )

  const [expandedFindings, setExpandedFindings] =
    useState<Set<string>>(new Set())

  // Resolve params
  if (!runId) {
    params.then((p) => setRunId(p.runId))
    return null
  }

  const {
    data: run,
    isLoading,
    error,
    refetch,
  } = useRunDetail(runId) as {
    data: RunDetail | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !run) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto">
          <Link
            href="/runs"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Runs
          </Link>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />

              <div>
                <p className="font-medium text-red-300">
                  Failed to load run details
                </p>

                <p className="text-sm text-red-200 mt-1">
                  {(error as any)?.message ||
                    'The run could not be found or accessed.'}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const toggleFinding = (id: string) => {
    const newSet = new Set(expandedFindings)

    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }

    setExpandedFindings(newSet)
  }

  const findings: Finding[] = run.findings || []

  const criticalFindings = findings.filter(
    (f: Finding) => f.severity === 'critical'
  ).length

  const highFindings = findings.filter(
    (f: Finding) => f.severity === 'high'
  ).length

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href="/runs"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Runs
        </Link>

        {/* Header */}
        <div className="space-y-6">
          {/* URL + Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-400">
                Audit:
              </span>

              <a
                href={run.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {truncate(run.url, 60)}

                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={run.status} />

              <span className="text-sm text-slate-400">
                {run.mode === 'manual'
                  ? 'Manual Audit'
                  : 'CI Audit'}
              </span>

              <span className="text-sm text-slate-500">
                {formatDate(run.createdAt)}
              </span>

              {run.duration &&
                run.status === 'completed' && (
                  <span className="text-sm text-slate-500">
                    Duration:{' '}
                    {formatDuration(run.duration)}
                  </span>
                )}
            </div>
          </div>

          {/* Score Section */}
          {run.status === 'completed' &&
            run.score !== undefined && (
              <div className="flex gap-8 items-center p-6 rounded-lg border border-slate-700/50 bg-slate-900/30">
                <ScoreRing
                  score={run.score}
                  size={140}
                  animated={true}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">
                      Overall Score
                    </h3>

                    <p className="text-2xl font-bold text-white">
                      {Math.round(run.score)}/100
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">
                      Result
                    </h3>

                    <p
                      className={`font-semibold ${
                        run.score >= 70
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {run.score >= 70
                        ? '✓ Passed'
                        : '✗ Failed'}
                    </p>
                  </div>

                  {findings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">
                        Issues Found
                      </h3>

                      <div className="space-y-1 text-sm">
                        {criticalFindings > 0 && (
                          <p className="text-red-400">
                            <span className="font-bold">
                              {criticalFindings}
                            </span>{' '}
                            Critical
                          </p>
                        )}

                        {highFindings > 0 && (
                          <p className="text-orange-400">
                            <span className="font-bold">
                              {highFindings}
                            </span>{' '}
                            High
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Running State */}
          {run.status === 'running' && (
            <div className="p-6 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />

                <div>
                  <p className="font-medium text-blue-300">
                    Audit in progress...
                  </p>

                  <p className="text-sm text-blue-200">
                    Results will appear as they arrive
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Stages */}
        {run.pipelineStages &&
          run.pipelineStages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Pipeline Progress
              </h2>

              <div className="space-y-3">
                {run.pipelineStages.map(
                  (
                    stage: PipelineStage,
                    i: number
                  ) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {stage.status ===
                            'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}

                          {stage.status ===
                            'running' && (
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                          )}

                          {stage.status ===
                            'pending' && (
                            <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
                          )}

                          {stage.status === 'error' && (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          )}

                          <div>
                            <h3 className="font-medium text-white">
                              {stage.name}
                            </h3>

                            {stage.duration && (
                              <p className="text-xs text-slate-500">
                                {formatDuration(
                                  stage.duration
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-slate-500 capitalize">
                          {stage.status}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Findings */}
        {findings.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Issues Found ({findings.length})
            </h2>

            <div className="space-y-3">
              {findings.map(
                (finding: Finding) => (
                  <div
                    key={finding.id}
                    className="rounded-lg border border-slate-700/50 bg-slate-900/30 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        toggleFinding(finding.id)
                      }
                      className="w-full p-4 hover:bg-slate-900/50 transition-colors text-left flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <SeverityBadge
                            severity={
                              finding.severity
                            }
                          />

                          <h3 className="font-medium text-white">
                            {finding.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-400">
                          {truncate(
                            finding.description,
                            100
                          )}
                        </p>

                        {finding.location && (
                          <p className="text-xs text-slate-500 font-mono">
                            {finding.location}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {finding.autoFixable && (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Auto-fixable
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded */}
                    {expandedFindings.has(
                      finding.id
                    ) && (
                      <div className="border-t border-slate-700/50 p-4 bg-slate-900/50 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">
                            Description
                          </h4>

                          <p className="text-sm text-slate-400">
                            {finding.description}
                          </p>
                        </div>

                        {finding.codeSnippet && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Code
                            </h4>

                            <pre className="p-3 rounded bg-slate-900 text-xs text-slate-400 overflow-x-auto border border-slate-700/50">
                              <code>
                                {
                                  finding.codeSnippet
                                }
                              </code>
                            </pre>
                          </div>
                        )}

                        {finding.suggestedFix && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Suggested Fix
                            </h4>

                            <p className="text-sm text-slate-400">
                              {
                                finding.suggestedFix
                              }
                            </p>
                          </div>
                        )}

                        {finding.autoFixable && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              Create Fix PR
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ) : run.status === 'completed' ? (
          <div className="text-center py-12 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-white mb-2">
              No issues found!
            </h3>

            <p className="text-emerald-300">
              Your website passes all audits.
            </p>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}