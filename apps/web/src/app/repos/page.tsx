'use client'

import Link from 'next/link'
import { DashboardShell } from '@/components/shell/dashboard-shell'
import { Button } from '@/components/ui/button'
import { useRepos } from '@/lib/hooks'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import { Loader2, GitBranch, AlertCircle } from 'lucide-react'

type Repo = {
  id: string
  name: string
  owner: string
  status: 'configured' | 'pending' | 'error'
  stagingUrl?: string
  lastRunScore?: number
  lastRunAt?: string
  passThreshold?: number
  autoFixEnabled?: boolean
  ignoredPaths?: string[]
}

export default function ReposPage() {
  const {
    data: repos,
    isLoading,
    error,
    refetch,
  } = useRepos() as {
    data: Repo[] | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }

  return (
    <DashboardShell>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <h1 style={{ fontFamily: 'var(--font-syne)' }} className="text-4xl font-bold bg-gradient-to-r from-[#1f2937] to-[#374151] bg-clip-text text-transparent">
              Connected Repos
            </h1>

            <p className="text-[#6b7280] text-lg">
              Manage your GitHub repositories and automation settings
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="https://github.com/apps/orion-qa/installations/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-lg hover:shadow-blue-500/30">
                <GitBranch className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Failed to load repositories</p>
                <p className="text-sm text-red-700 mt-1">
                  {error?.message ||
                    'Please try again or check your connection.'}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => refetch()}
                className="bg-red-100 text-red-700 hover:bg-red-200"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          (!repos || repos.length === 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 rounded-2xl border border-blue-100/40 bg-white/50 backdrop-blur-md"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
                <GitBranch className="h-8 w-8 text-[#2563eb]" />
              </div>

              <h3 className="text-2xl font-bold text-[#1f2937] mb-2">
                No repositories connected yet
              </h3>

              <p className="text-[#6b7280] mb-8 max-w-md mx-auto">
                Install Orion on GitHub to start monitoring your repositories for quality and performance issues.
              </p>

              <a
                href="https://github.com/apps/orion-qa/installations/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-lg hover:shadow-blue-500/30">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Install GitHub App
                </Button>
              </a>
            </motion.div>
          )}

        {/* Repositories Grid */}
        {!isLoading &&
          !error &&
          repos &&
          repos.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo: Repo, idx: number) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="rounded-2xl p-6 border border-blue-100/40 bg-white/60 backdrop-blur-md hover:bg-white/80 hover:shadow-xl hover:shadow-blue-200/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    // Navigate to repo details
                    window.location.href = `/repos/${repo.id}`
                  }}
                >
                  <div className="space-y-5">
                    {/* Repo Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-[#1f2937] truncate group-hover:text-[#2563eb] transition-colors">
                          {repo.name}
                        </h3>

                        <p className="text-sm text-[#6b7280] mt-1">
                          {repo.owner}/{repo.name}
                        </p>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {repo.status ===
                          'configured' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            Connected
                          </span>
                        )}

                        {repo.status === 'pending' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}

                        {repo.status === 'error' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            Error
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Staging URL */}
                    <div className="space-y-1 pb-4 border-b border-blue-100/30">
                      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Staging URL</p>

                      <p className="text-sm text-[#1f2937] font-mono truncate">
                        {repo.stagingUrl || 'Not configured'}
                      </p>
                    </div>

                    {/* Stats */}
                    {repo.lastRunScore !== undefined && (
                      <div className="grid grid-cols-3 gap-3 py-3 border-b border-blue-100/30">
                        <div>
                          <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-wider">Last Score</p>

                          <p className="text-xl font-bold text-[#2563eb] mt-1">
                            {Math.round(
                              repo.lastRunScore
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-wider">Last Audit</p>

                          <p className="text-xs text-[#1f2937] mt-1 font-medium">
                            {repo.lastRunAt
                              ? formatDate(
                                  repo.lastRunAt
                                ).split(',')[0]
                              : 'Never'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-wider">Threshold</p>

                          <p className="text-xl font-bold text-[#1f2937] mt-1">
                            {repo.passThreshold ?? '-'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Repo Config */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6b7280] font-medium">Auto-fix enabled</span>

                        <span className={`font-bold ${repo.autoFixEnabled ? 'text-green-600' : 'text-[#6b7280]'}`}>
                          {repo.autoFixEnabled
                            ? '✓'
                            : '✗'}
                        </span>
                      </div>

                      {repo.ignoredPaths &&
                        repo.ignoredPaths.length >
                          0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6b7280] font-medium">Ignored paths</span>

                            <span className="text-[#1f2937] font-semibold">
                              {
                                repo.ignoredPaths
                                  .length
                              }{' '}
                              path
                              {repo.ignoredPaths
                                .length !== 1
                                ? 's'
                                : ''}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* CTA */}
                    <p className="text-xs text-[#2563eb] font-semibold pt-2 group-hover:translate-x-1 transition-transform">
                      View details →
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </motion.div>
    </DashboardShell>
  )
}
