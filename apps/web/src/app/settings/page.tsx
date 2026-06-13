'use client'

import { DashboardShell } from '@/components/shell/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Moon, GitBranch } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage your Orion preferences</p>
        </div>

        {/* Theme Section */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-700/50 bg-slate-900/30">
          <h2 className="text-lg font-semibold text-white">Appearance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Theme</p>
                <p className="text-sm text-slate-400">
                  Orion uses a dark theme for optimal readability
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-500 text-white cursor-default"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Integration Section */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-700/50 bg-slate-900/30">
          <h2 className="text-lg font-semibold text-white">GitHub Integration</h2>
          <div className="space-y-4">
            <p className="text-slate-400">
              Connect your GitHub account to enable automatic quality checks on every push and pull request.
            </p>
            <a href="https://github.com/apps/orion-qa/installations/new" target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <GitBranch className="h-4 w-4 mr-2" />
                Open GitHub App
              </Button>
            </a>
          </div>
        </div>

        {/* API Info Section */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-700/50 bg-slate-900/30">
          <h2 className="text-lg font-semibold text-white">API Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">API Base URL</p>
              <p className="text-slate-300 font-mono">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Frontend Version</p>
              <p className="text-slate-300">1.0.0</p>
            </div>
            <div>
              <p className="text-slate-500">Environment</p>
              <p className="text-slate-300 capitalize">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-700/50 bg-slate-900/30">
          <h2 className="text-lg font-semibold text-white">About Orion</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              Orion is an autonomous quality assurance platform that automatically audits your web applications across performance, accessibility, and best practices.
            </p>
            <div className="space-y-2 pt-2">
              <p>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  GitHub Repository →
                </a>
              </p>
              <p>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Documentation →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
