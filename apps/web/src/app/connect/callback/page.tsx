"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Globe,
  GitBranch,
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  Search,
} from "lucide-react"
import Link from "next/link"
import { reposApi } from "@/lib/api"
import type { ConnectedRepo } from "@/lib/types"

// ──────────────────────────────────────────────────────────
// Stepper — 3-step progress indicator
// ──────────────────────────────────────────────────────────
function Stepper({ step }: { step: 2 | 3 }) {
  return (
    <div className="flex items-center justify-between mb-9 relative">
      {/* Background line */}
      <div className="absolute top-3 left-6 right-6 h-0.5 bg-[#E1E2EC] z-0" />
      {/* Active fill */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: step === 3 ? "100%" : "50%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute top-3 left-6 h-0.5 bg-[#0969DA] z-10 origin-left"
      />

      {/* Step 1 — Connected */}
      <div className="relative z-20 flex flex-col items-center gap-2 bg-white px-2">
        <div className="w-[26px] h-[26px] rounded-full bg-[#1A7F37] text-white flex items-center justify-center border-2 border-white shadow-[0_0_0_2px_#A7F3D0]">
          <CheckCircle2 size={14} />
        </div>
        <span className="text-[11px] font-bold text-[#1A7F37]">Connected</span>
      </div>

      {/* Step 2 — Configure */}
      <div className="relative z-20 flex flex-col items-center gap-2 bg-white px-2">
        <div
          className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-white transition-all duration-300 ${
            step === 3
              ? "bg-[#1A7F37] text-white shadow-[0_0_0_2px_#A7F3D0]"
              : "bg-[#F0F6FC] text-[#0969DA] shadow-[0_0_0_3px_#C2DBF5]"
          }`}
        >
          {step === 3 ? <CheckCircle2 size={14} /> : <span className="text-xs font-extrabold">2</span>}
        </div>
        <span className={`text-[11px] font-bold ${step === 3 ? "text-[#1A7F37]" : "text-[#0969DA]"}`}>
          Configure
        </span>
      </div>

      {/* Step 3 — Done */}
      <div className="relative z-20 flex flex-col items-center gap-2 bg-white px-2">
        <div
          className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-white transition-all duration-300 ${
            step === 3
              ? "bg-[#F0F6FC] text-[#0969DA] shadow-[0_0_0_3px_#C2DBF5]"
              : "bg-[#F6F8FA] text-[#8B949E] shadow-[0_0_0_2px_#D0D7DE]"
          }`}
        >
          <span className="text-xs font-extrabold">3</span>
        </div>
        <span className={`text-[11px] font-bold ${step === 3 ? "text-[#0969DA]" : "text-[#8B949E]"}`}>
          Done
        </span>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Inner component (uses useSearchParams)
// ──────────────────────────────────────────────────────────
function ConnectCallbackInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isLoadingRepo, setIsLoadingRepo] = useState(true)
  const [repo, setRepo] = useState<ConnectedRepo | null>(null)
  const [stagingUrl, setStagingUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  // Fetch repos and match by installation_id
  useEffect(() => {
    let active = true
    const fetchMatchedRepo = async () => {
      const installationId = searchParams.get("installation_id")
      if (!installationId) {
        if (active) {
          setIsLoadingRepo(false)
          setFetchError(true)
        }
        return
      }

      try {
        const reposList = await reposApi.getRepos()
        if (active) {
          const matched = reposList.find(
            (r: ConnectedRepo) => String(r.installationId) === String(installationId)
          )
          if (matched) {
            setRepo(matched)
            setStagingUrl(matched.stagingUrl || "")
          } else {
            setFetchError(true)
          }
        }
      } catch (err) {
        console.error("Failed to fetch repos for match:", err)
        if (active) setFetchError(true)
      } finally {
        if (active) setIsLoadingRepo(false)
      }
    }
    fetchMatchedRepo()
    return () => {
      active = false
    }
  }, [searchParams])

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!repo || !stagingUrl.trim()) return

      try {
        setIsSaving(true)
        setSaveError(null)
        await reposApi.updateRepo(repo.id, { stagingUrl: stagingUrl.trim() })
        setIsSuccess(true)
      } catch (err: any) {
        setSaveError(err?.message || "Failed to update staging URL. Please try again.")
      } finally {
        setIsSaving(false)
      }
    },
    [repo, stagingUrl]
  )

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] bg-white rounded-3xl border border-[#F0F2F5] shadow-[0_8px_32px_rgba(15,23,42,0.04)] p-9 md:p-10 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* ── Loading State ── */}
          {isLoadingRepo && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-10"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0F6FC] border border-[#C2DBF5] flex items-center justify-center">
                <div className="w-5 h-5 border-[3px] border-[#C2DBF5] border-t-[#0969DA] rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <h2 className="bricolage font-bold text-lg text-[#1F2328] mb-1">
                  Connecting your repo...
                </h2>
                <p className="text-[13px] text-[#656D76]">
                  Fetching installation details from GitHub.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Error / Not Found ── */}
          {!isLoadingRepo && (fetchError || !repo) && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-5 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFEBE9] text-[#CF222E] flex items-center justify-center mb-2 border-4 border-[#FEE2E2]">
                <AlertCircle size={32} />
              </div>
              <h1 className="bricolage font-extrabold text-2xl text-[#1F2328] tracking-tight mb-1">
                Something went wrong
              </h1>
              <p className="text-sm text-[#656D76] leading-relaxed">
                We couldn&apos;t find your connected repo. The link might be invalid or the app may
                not have been fully installed.
              </p>
              <Link
                href="/repos"
                className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F0F2F5] border border-[#D0D7DE] text-[#1F2328] font-bold text-sm hover:bg-[#E2E8F0] transition-colors no-underline"
              >
                Go to Repos
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* ── Success State ── */}
          {!isLoadingRepo && repo && isSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <Stepper step={3} />

              <div className="relative mb-5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-[#E6F4EA] text-[#1A7F37] flex items-center justify-center border-[5px] border-[#A7F3D0]"
                >
                  <CheckCircle2 size={36} strokeWidth={2.5} />
                </motion.div>
              </div>

              <h1 className="bricolage font-extrabold text-[28px] text-[#1F2328] tracking-tight mb-2">
                You&apos;re all set!
              </h1>
              <p className="text-sm text-[#656D76] leading-relaxed mb-8 max-w-[320px]">
                We&apos;re ready to start auditing your repository for quality regressions.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/repos/${repo.id}`}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#0969DA] text-white font-bold text-sm hover:bg-[#0558B7] hover:-translate-y-0.5 transition-all no-underline w-full shadow-[0_2px_12px_rgba(9,105,218,0.28)]"
                >
                  <Search size={16} />
                  View Repo Details
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#F0F2F5] border border-[#D0D7DE] text-[#1F2328] font-bold text-sm hover:bg-[#E2E8F0] transition-colors no-underline w-full"
                >
                  <LayoutDashboard size={15} />
                  Go to Dashboard
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Configure State (Step 2) ── */}
          {!isLoadingRepo && repo && !isSuccess && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Stepper step={2} />

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#F0F6FC] text-[#0969DA] flex items-center justify-center border-4 border-[#C2DBF5] mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <h1 className="bricolage font-extrabold text-[26px] text-[#1F2328] tracking-tight mb-2">
                  GitHub App Connected!
                </h1>
                <p className="text-sm text-[#656D76] leading-relaxed">
                  Your repository was linked to Orion. Set the staging URL our agents will audit.
                </p>
              </div>

              {/* Repo display */}
              <div className="bg-[#FAFBFC] border border-[#F0F2F5] rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#D0D7DE] flex items-center justify-center shrink-0">
                  <GitBranch size={20} className="text-[#1F2328]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] mb-0.5">
                    Connected Repo
                  </div>
                  <div className="bricolage font-bold text-[15px] text-[#1F2328] truncate">
                    <span className="text-[#656D76] font-medium">{repo.owner}/</span>
                    {repo.name}
                  </div>
                </div>
              </div>

              {/* Staging URL form */}
              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#1F2328] mb-1.5">
                    Staging Environment URL
                  </label>
                  <div className="relative">
                    <Globe
                      size={15}
                      className="absolute top-1/2 -translate-y-1/2 left-3.5 text-[#8B949E] pointer-events-none"
                    />
                    <input
                      type="url"
                      required
                      placeholder="https://your-staging.com"
                      value={stagingUrl}
                      onChange={(e) => setStagingUrl(e.target.value)}
                      disabled={isSaving}
                      className="w-full h-[46px] pl-[38px] pr-3.5 text-sm text-[#1F2328] font-mono bg-white border border-[#D0D7DE] rounded-xl outline-none focus:border-[#0969DA] focus:shadow-[0_0_0_3px_rgba(9,105,218,0.14)] transition-all placeholder:text-[#8B949E] disabled:opacity-60"
                    />
                  </div>
                  {saveError && (
                    <p className="text-xs text-[#CF222E] font-semibold mt-1.5">{saveError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  <button
                    type="submit"
                    disabled={isSaving || !stagingUrl.trim()}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-[#0969DA] text-white font-bold text-sm rounded-xl hover:bg-[#0558B7] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_2px_12px_rgba(9,105,218,0.28)]"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      "Start Monitoring"
                    )}
                  </button>
                  <p className="text-[11.5px] text-[#8B949E] text-center font-medium">
                    You can always change this later from the repos page.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Page export with Suspense boundary
// ──────────────────────────────────────────────────────────
export default function ConnectCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#F0F6FC] border border-[#C2DBF5] flex items-center justify-center">
            <div className="w-5 h-5 border-[3px] border-[#C2DBF5] border-t-[#0969DA] rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <ConnectCallbackInner />
    </Suspense>
  )
}