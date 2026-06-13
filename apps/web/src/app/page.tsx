"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Crosshair,
  Bell,
  Command,
  GitBranch,
  Menu,
  Play,
  Globe,
  Zap,
  Check,
  X,
  TrendingUp,
  BarChart3,
  Target,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Search,
  XCircle,
  CheckCircle2,
  Wrench,
} from "lucide-react"
import { runsApi, reposApi } from "@/lib/api"
import { cn, formatDate, formatDuration, getScoreLabel, getScoreColor, getStatusColor } from "@/lib/utils"
import type { Run, ConnectedRepo } from "@/lib/types"

// ────────────────────────────────────────────────────────
// ScoreArc – circular progress indicator
// ────────────────────────────────────────────────────────
function ScoreArc({ score, size = 140, animate = true }: { score: number; size?: number; animate?: boolean }) {
  const center = size / 2
  const radius = center - 10
  const circumference = 2 * Math.PI * radius
  const arcLength = (Math.min(Math.max(score, 0), 100) / 100) * circumference

  // Use the existing utility for colour (returns Tailwind class, we need hex)
  const colorClass = getScoreColor(score)
  // Extract hex colour from Tailwind class (fallback to a sensible default)
  const colorHex =
    colorClass === "text-green-400" ? "#1A7F37" :
    colorClass === "text-emerald-400" ? "#1A7F37" :
    colorClass === "text-amber-400" ? "#9A6700" :
    colorClass === "text-red-400" ? "#CF222E" : "#CF222E"

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score: ${score} out of 100`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#F0F2F5" strokeWidth="8" />
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={colorHex} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference - arcLength }}
          animate={{ strokeDashoffset: circumference - arcLength }}
          transition={animate ? { type: "spring", stiffness: 80, damping: 12 } : { duration: 0 }}
        />
      </svg>
      <span className="absolute bricolage font-bold text-[20px]" style={{ color: colorHex }}>
        {score}
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// StatCard – one of the five stat cards
// ────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, children }: {
  label: string
  value: string | number
  icon: any
  accent: string
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 backdrop-blur-sm border border-[#D0D7DE] rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <Icon className="w-5 h-5 mb-2" style={{ color: accent }} />
      {children ? (
        children
      ) : (
        <div>
          <p className="bricolage font-extrabold text-2xl text-[#1F2328]">{value}</p>
          <p className="text-[13px] text-[#656D76] mt-0.5">{label}</p>
        </div>
      )}
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────
// NavBar – sticky glass navigation
// ────────────────────────────────────────────────────────
function NavBar() {
  const router = useRouter()
  const pathname = "/" // since it's always the dashboard

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(250,251,252,0.88)] backdrop-blur-[18px] border-b border-[#D0D7DE] h-14 flex items-center px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-[#1F2328] rounded-md flex items-center justify-center">
          <Crosshair className="w-4 h-4 text-white" />
        </div>
        <span className="bricolage font-extrabold text-lg text-[#1F2328]">Orion</span>
      </Link>

      <div className="hidden md:flex items-center gap-1 ml-8">
        {["Dashboard", "Runs", "Repos", "Docs"].map((label) => {
          const href = label === "Dashboard" ? "/" : `/${label.toLowerCase()}`
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                pathname === href
                  ? "bg-[#F0F6FC] text-[#0969DA]"
                  : "text-[#656D76] hover:bg-[#F0F2F5] hover:text-[#1F2328]"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/connect/callback"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border border-[#D0D7DE] text-[#1F2328] rounded-md hover:border-[#0969DA] hover:bg-[#F0F6FC] transition-all"
        >
          <GitBranch className="w-4 h-4" />
          Connect GitHub
        </Link>
        <button className="md:hidden p-2 rounded-md hover:bg-[#F0F2F5]">
          <Menu className="w-5 h-5 text-[#656D76]" />
        </button>
      </div>
    </nav>
  )
}

// ────────────────────────────────────────────────────────
// Dashboard Page
// ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [urlInput, setUrlInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  // Fetch runs (paginated, with optional status filter)
  const {
    data: runsData,
    isLoading: runsLoading,
    error: runsError,
  } = useQuery({
    queryKey: ["runs", statusFilter, page],
    queryFn: () =>
      runsApi.getRuns({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
      }),
    placeholderData: (prev) => prev,
  })

  // Fetch repos for stats (we'll compute pass/fail counts from all runs)
  const { data: repos } = useQuery({
    queryKey: ["repos"],
    queryFn: () => reposApi.getRepos(),
  })

  // Create run mutation
  const createRunMutation = useMutation({
    mutationFn: (url: string) => runsApi.createRun({ url }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runs"] })
      router.push(`/runs/${data.id}`)
    },
  })

  // Derived statistics (from runs data – you could replace with a dedicated stats endpoint)
  const stats = useMemo(() => {
    if (!runsData?.data) return null
    const runs = runsData.data as Run[]
    const total = runsData.total ?? runs.length
    const passedCount = runs.filter((r) => r.pass === true).length
    const failedCount = runs.filter((r) => r.pass === false).length
    const averageScore = runs.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (runs.length || 1)
    return { totalRuns: total, passedCount, failedCount, averageScore: Math.round(averageScore) }
  }, [runsData])

  const runs = (runsData?.data as Run[]) ?? []
  const totalPages = runsData ? Math.max(1, Math.ceil((runsData.total ?? runs.length) / 10)) : 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (trimmed && !createRunMutation.isPending) {
      createRunMutation.mutate(trimmed)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-[#D0D7DE] rounded-2xl p-6 md:p-10 relative overflow-hidden mb-8"
        >
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F2F5] text-[#656D76] text-xs font-medium rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" /> AI-powered website auditing · v2.4
            </span>
            <h1 className="bricolage font-extrabold text-4xl md:text-5xl leading-tight text-[#1F2328] mb-4">
              Know your site&apos;s health{" "}
              <span className="text-[#0969DA] italic underline decoration-wavy underline-offset-4">before</span> your users do.
            </h1>
            <p className="text-lg text-[#656D76] mb-8">
              Orion deploys AI agents across your site to surface performance gaps, broken flows, and accessibility issues — then delivers a clear, actionable score.
            </p>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="flex items-center bg-white border border-[#D0D7DE] rounded-lg focus-within:border-[#0969DA] focus-within:ring-2 focus-within:ring-[#0969DA]/20 transition">
                <Globe className="w-5 h-5 text-[#8B949E] ml-4" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste a URL to audit..."
                  className="flex-1 px-3 py-3 text-sm bg-transparent outline-none placeholder:text-[#8B949E]"
                  disabled={createRunMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={createRunMutation.isPending || !urlInput.trim()}
                  className="flex items-center gap-2 px-5 py-3 bg-[#0969DA] text-white text-sm font-semibold rounded-r-lg hover:bg-[#0558B7] disabled:opacity-50 transition"
                >
                  {createRunMutation.isPending ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  {createRunMutation.isPending ? "Analyzing..." : "Run Analysis"}
                </button>
              </div>
              {createRunMutation.isError && (
                <p className="text-xs text-[#CF222E] mt-2">
                  {(createRunMutation.error as any)?.message || "Failed to start analysis."}
                </p>
              )}
            </form>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#8B949E]">
              <span>✓ Paste any public URL</span>
              <span className="text-[#D0D7DE]">·</span>
              <span>✓ Results in under 3 min</span>
              <span className="text-[#D0D7DE]">·</span>
              <span>✓ No sign-up required</span>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-xs text-[#8B949E]">Or</span>
              <Link href="/connect/callback" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0969DA] hover:underline">
                <GitBranch className="w-4 h-4" />
                Install on GitHub →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Runs" value={stats.totalRuns} icon={BarChart3} accent="#0969DA" />
            <StatCard label="Passed" value={stats.passedCount} icon={Check} accent="#1A7F37" />
            <StatCard label="Failed" value={stats.failedCount} icon={X} accent="#CF222E" />
            <StatCard label="Avg Score" value={`${stats.averageScore}`} icon={TrendingUp} accent="#9A6700" />
          </div>
        )}

        {/* Runs Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-[#D0D7DE] rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#F0F2F5]">
            <h2 className="bricolage font-bold text-lg text-[#1F2328]">Recent Runs</h2>
            <Link href="/runs" className="text-sm font-medium text-[#0969DA] hover:underline">View all →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFBFC] text-left">
                  {["URL", "Score", "Status", "Mode", "Duration", "Created"].map((h) => (
                    <th key={h} className="px-4 md:px-6 py-3 text-[11px] font-semibold text-[#656D76] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F0F2F5]">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 md:px-6 py-4"><div className="h-4 bg-[#F0F2F5] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Search className="w-10 h-10 text-[#8B949E] mx-auto mb-3" />
                      <p className="font-bold text-[#1F2328]">No runs yet</p>
                      <p className="text-sm text-[#656D76]">Paste a URL above to start.</p>
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/runs/${run.id}`)}
                      className="border-b border-[#F0F2F5] hover:bg-[#F0F6FC]/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#8B949E]" />
                          <span className="text-sm truncate max-w-[200px]">{run.url?.replace(/^https?:\/\//, "")}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {run.overallScore != null ? (
                          <ScoreArc score={run.overallScore} size={44} animate={false} />
                        ) : (
                          <span className="text-sm text-[#8B949E]">—</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full", getStatusColor(run.status))}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-[#656D76]">{run.mode || "manual"}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-[#656D76]">
                        {run.duration ? formatDuration(run.duration / 1000) : "—"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-[#656D76]">
                        {formatDate(run.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1 px-4 py-3 border-t border-[#F0F2F5]">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-[#F0F2F5] disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-[#656D76]" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn("min-w-[32px] h-8 text-xs font-medium rounded", page === p ? "bg-[#0969DA] text-white" : "text-[#656D76] hover:bg-[#F0F2F5]")}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-[#F0F2F5] disabled:opacity-30">
                <ChevronRight className="w-4 h-4 text-[#656D76]" />
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}