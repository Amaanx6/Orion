'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { githubApi } from '@/lib/api'
import {
  Globe,
  GitBranch,
  Bell,
  Shield,
  Zap,
  Save,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
  Copy,
  Server,
  Terminal,
  Activity,
  Search,
  Target,
} from 'lucide-react'
import Link from 'next/link'

// ──────────────────────────────────────────────────────────
// Toggle Switch Component
// ──────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-[#1A7F37]' : 'bg-[#D0D7DE]'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ──────────────────────────────────────────────────────────
// Settings Section Wrapper
// ──────────────────────────────────────────────────────────
function SettingsSection({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: any
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-blue-100/40 bg-white/60 backdrop-blur-md p-6 md:p-8"
    >
      <h2 className="bricolage font-bold text-xl text-[#1f2937] mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#2563eb]" />
        </div>
        {title}
      </h2>
      {children}
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────
// Main Settings Page
// ──────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const [settings, setSettings] = useState({
    defaultStagingUrl: '',
    qualityThreshold: 70,
    autoFixEnabled: true,
    theme: 'light',
    notificationsEnabled: true,
    notifyOnPass: true,
    notifyOnFail: true,
    notifyOnFix: true,
    notifyOnDeploy: false,
    discoveryAgent: true,
    performanceAgent: true,
    hygieneAgent: true,
    scoringAgent: true,
    maxConcurrentRuns: 3,
    runTimeout: 300,
    retainRunsDays: 90,
    ignorePatterns: '/node_modules/**, /dist/**, /build/**',
  })

  // Check GitHub App installation status
  const { data: installationStatus, isLoading: checkingInstallation } = useQuery({
    queryKey: ['github-installation'],
    queryFn: () => githubApi.getInstallationStatus(),
    staleTime: 60000,
    retry: 1,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const copyApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#f8f9fb] to-[#f0f3f8]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="bricolage font-extrabold text-4xl text-[#1f2937] mb-2">Settings</h1>
          <p className="text-[#6b7280] text-lg">Configure your Orion instance and preferences</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── General Settings ── */}
          <SettingsSection icon={Globe} title="General" delay={0}>
            <div className="space-y-6">
              {/* Default Staging URL */}
              <div>
                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                  Default Staging URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
                  <input
                    type="url"
                    value={settings.defaultStagingUrl}
                    onChange={(e) => setSettings({ ...settings, defaultStagingUrl: e.target.value })}
                    placeholder="https://staging.example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D0D7DE] rounded-xl text-sm text-[#1f2937] placeholder-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-[#6b7280] mt-1.5">
                  Fallback URL used when no staging URL is configured for a repository.
                </p>
              </div>

              {/* Quality Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#1f2937]">
                    Quality Threshold
                  </label>
                  <span className="bricolage font-bold text-lg text-[#2563eb]">
                    {settings.qualityThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.qualityThreshold}
                  onChange={(e) => setSettings({ ...settings, qualityThreshold: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#E1E2EC] rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                />
                <div className="flex justify-between text-xs text-[#8B949E] mt-1.5">
                  <span>Lenient (0)</span>
                  <span>Strict (100)</span>
                </div>
                <p className="text-xs text-[#6b7280] mt-1">
                  PRs scoring below this threshold will be blocked from merging. Recommended: 70-80.
                </p>
              </div>

              {/* Auto-Fix Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <div>
                  <p className="text-sm font-semibold text-[#1f2937] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#8250DF]" />
                    Auto-Fix PRs
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Automatically create fix PRs for AI-resolvable issues found during audits.
                  </p>
                </div>
                <Toggle
                  enabled={settings.autoFixEnabled}
                  onChange={() => setSettings({ ...settings, autoFixEnabled: !settings.autoFixEnabled })}
                />
              </div>
            </div>
          </SettingsSection>

          {/* ── Active Agents ── */}
          <SettingsSection icon={Activity} title="Active Agents" delay={0.1}>
            <p className="text-sm text-[#6b7280] mb-5">
              Select which AI agents run during each audit. Disabling agents will speed up runs but reduce coverage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'discoveryAgent', label: 'Discovery Agent', desc: 'Crawls pages and maps site structure', icon: Search },
                { key: 'performanceAgent', label: 'Performance Agent', desc: 'Analyzes load times, Core Web Vitals, and rendering', icon: Zap },
                { key: 'hygieneAgent', label: 'Hygiene Agent', desc: 'Checks accessibility, SEO, and best practices', icon: Shield },
                { key: 'scoringAgent', label: 'Scoring Agent', desc: 'Aggregates results into final quality score', icon: Target },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-start justify-between p-4 rounded-xl bg-white border border-[#F0F2F5] hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#2563eb] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#1f2937]">{label}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Toggle
                    enabled={settings[key as keyof typeof settings] as boolean}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        [key]: !settings[key as keyof typeof settings],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* ── Notifications ── */}
          <SettingsSection icon={Bell} title="Notifications" delay={0.2}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <div>
                  <p className="text-sm font-semibold text-[#1f2937]">Enable Notifications</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Receive alerts for important Orion events</p>
                </div>
                <Toggle
                  enabled={settings.notificationsEnabled}
                  onChange={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                />
              </div>

              {settings.notificationsEnabled && (
                <div className="space-y-2 pl-4">
                  {[
                    { key: 'notifyOnPass', label: 'Run Passed', desc: 'When a quality check passes successfully' },
                    { key: 'notifyOnFail', label: 'Run Failed / PR Blocked', desc: 'When a quality check fails or a PR is blocked' },
                    { key: 'notifyOnFix', label: 'Auto-Fix PR Created', desc: 'When Orion auto-generates a fix pull request' },
                    { key: 'notifyOnDeploy', label: 'Deployment Detected', desc: 'When a new deployment triggers an audit' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-blue-50/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[#1f2937]">{label}</p>
                        <p className="text-xs text-[#6b7280]">{desc}</p>
                      </div>
                      <Toggle
                        enabled={settings[key as keyof typeof settings] as boolean}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            [key]: !settings[key as keyof typeof settings],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SettingsSection>

          {/* ── GitHub Integration ── */}
          <SettingsSection icon={GitBranch} title="GitHub Integration" delay={0.3}>
            <div className="space-y-4">
              {checkingInstallation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-[3px] border-blue-100 border-t-[#2563eb] rounded-full animate-spin" />
                </div>
              ) : installationStatus?.installed ? (
                <>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#E6F4EA] border border-[#1A7F37]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1A7F37]/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-[#1A7F37]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1f2937]">GitHub App Installed</p>
                        <p className="text-xs text-[#6b7280]">Orion QA App is connected to your repositories</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A7F37]/10 text-[#1A7F37] text-xs font-semibold border border-[#1A7F37]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A7F37]" />
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={process.env.NEXT_PUBLIC_GITHUB_APP_URL || 'https://github.com/apps/orion-qa/installations/new'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-[#D0D7DE] text-[#1f2937] rounded-xl hover:bg-[#F0F2F5] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Manage Installation
                    </a>
                    <Link
                      href="/repos"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#2563eb] text-white rounded-xl hover:bg-[#1d4ed8] transition-colors"
                    >
                      <GitBranch className="w-4 h-4" />
                      View Connected Repos
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
                    <GitBranch className="w-8 h-8 text-[#2563eb]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1f2937] mb-2">GitHub App Not Installed</h3>
                  <p className="text-sm text-[#6b7280] mb-6 max-w-md mx-auto">
                    Install the Orion GitHub App to enable automated quality checks on every push and pull request.
                  </p>
                  <a
                    href={process.env.NEXT_PUBLIC_GITHUB_APP_URL || 'https://github.com/apps/orion-qa/installations/new'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <GitBranch className="w-4 h-4" />
                    Install GitHub App
                  </a>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* ── Advanced ── */}
          <SettingsSection icon={Terminal} title="Advanced" delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                  Max Concurrent Runs
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxConcurrentRuns}
                  onChange={(e) => setSettings({ ...settings, maxConcurrentRuns: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-[#D0D7DE] rounded-xl text-sm focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <p className="text-xs text-[#6b7280] mt-1.5">Maximum simultaneous audit runs.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                  Run Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  max="1800"
                  step="30"
                  value={settings.runTimeout}
                  onChange={(e) => setSettings({ ...settings, runTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-[#D0D7DE] rounded-xl text-sm focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <p className="text-xs text-[#6b7280] mt-1.5">Maximum time before a run is cancelled.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                  Retain Run History (days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.retainRunsDays}
                  onChange={(e) => setSettings({ ...settings, retainRunsDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-[#D0D7DE] rounded-xl text-sm focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <p className="text-xs text-[#6b7280] mt-1.5">Runs older than this will be automatically purged.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                  Ignored Path Patterns
                </label>
                <input
                  type="text"
                  value={settings.ignorePatterns}
                  onChange={(e) => setSettings({ ...settings, ignorePatterns: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#D0D7DE] rounded-xl text-sm font-mono focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <p className="text-xs text-[#6b7280] mt-1.5">Comma-separated glob patterns to skip during audits.</p>
              </div>
            </div>
          </SettingsSection>

          {/* ── API & System Info ── */}
          <SettingsSection icon={Server} title="System Information" delay={0.5}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <p className="text-xs text-[#8B949E] uppercase tracking-wider font-semibold mb-1">API Base URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-[#1f2937]">
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}
                  </code>
                  <button
                    onClick={copyApiUrl}
                    className="p-1 rounded hover:bg-blue-100 transition-colors"
                    aria-label="Copy API URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#1A7F37]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#8B949E]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <p className="text-xs text-[#8B949E] uppercase tracking-wider font-semibold mb-1">Frontend Version</p>
                <p className="text-sm font-mono text-[#1f2937]">v2.4.0</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <p className="text-xs text-[#8B949E] uppercase tracking-wider font-semibold mb-1">Environment</p>
                <p className="text-sm font-semibold text-[#1f2937] capitalize">
                  {process.env.NODE_ENV || 'development'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/40">
                <p className="text-xs text-[#8B949E] uppercase tracking-wider font-semibold mb-1">GitHub App</p>
                {checkingInstallation ? (
                  <div className="w-4 h-4 border-2 border-blue-100 border-t-[#2563eb] rounded-full animate-spin mt-1" />
                ) : installationStatus?.installed ? (
                  <p className="text-sm font-semibold text-[#1A7F37] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A7F37]" />
                    Connected
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-[#8B949E] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D0D7DE]" />
                    Not Connected
                  </p>
                )}
              </div>
            </div>
          </SettingsSection>

          {/* ── Danger Zone ── */}
          <SettingsSection icon={AlertCircle} title="Danger Zone" delay={0.6}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div>
                  <p className="text-sm font-semibold text-[#CF222E]">Delete All Run History</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Permanently remove all audit run data. This action cannot be undone.
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-[#CF222E] text-[#CF222E] rounded-lg hover:bg-red-100 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              </div>

              {installationStatus?.installed && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <div>
                    <p className="text-sm font-semibold text-[#CF222E]">Disconnect GitHub App</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      Remove Orion's access to your GitHub repositories. Auto-fix and CI checks will stop.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-[#CF222E] text-[#CF222E] rounded-lg hover:bg-red-100 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* ── Save Button ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end sticky bottom-6"
          >
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563eb] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/30 transition-all shadow-md"
            >
              {saved ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                  Settings Saved
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save All Settings
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}