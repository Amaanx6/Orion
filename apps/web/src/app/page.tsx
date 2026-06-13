'use client'

import { useState } from 'react'
import Link from 'next/link'

import { DashboardShell } from '../components/shell/dashboard-shell'
import { Button } from '@/components/ui/button'

import {
  ArrowRight,
  GitBranch,
  Zap,
  BarChart3,
  Shield,
  Layers,
  Cpu,
} from 'lucide-react'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] =
    useState<number | null>(null)

  return (
    <DashboardShell>
      {/* Hero Section */}
      <section className="space-y-8 py-16 md:py-24">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Autonomous Quality Assurance for
            Your Web Applications
          </h1>

          <p className="text-lg md:text-xl text-slate-300">
            Orion automatically audits your
            applications across performance,
            accessibility, and best practices.
            Deploy with confidence.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/manual">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
            >
              Try Manual Audit

              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <a
            href="https://github.com/apps/orion-qa/installations/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 w-full sm:w-auto"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Install on GitHub
            </Button>
          </a>
        </div>

        {/* Feature Highlight */}
        <div className="mt-12 rounded-lg border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
          <p className="text-sm text-slate-400 mb-3">
            No authentication required for
            manual audits. GitHub installation
            enables automatic CI integration.
          </p>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />

            <span className="text-sm text-slate-300">
              Your data is processed securely and
              privately.
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-12 py-16 md:py-24">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            How It Works
          </h2>

          <p className="text-lg text-slate-400">
            Three simple steps to better quality
            assurance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'Submit Your URL',
              description:
                'Enter any public URL or install on GitHub for automatic checks on every push and pull request.',
            },
            {
              icon: Cpu,
              title: 'Automated Analysis',
              description:
                'Orion runs comprehensive audits covering performance, accessibility, best practices, and security.',
            },
            {
              icon: BarChart3,
              title: 'Get Actionable Results',
              description:
                'Receive detailed reports with fixes, suggestions, and auto-fix PRs for common issues.',
            },
          ].map((step, i) => {
            const Icon = step.icon

            return (
              <div
                key={i}
                className="group relative rounded-lg border border-slate-700/50 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all hover:border-emerald-500/50"
                onMouseEnter={() =>
                  setHoveredFeature(i)
                }
                onMouseLeave={() =>
                  setHoveredFeature(null)
                }
              >
                <div className="mb-4">
                  <div className="inline-block p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Icon className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-slate-400">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12 py-16 md:py-24">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Comprehensive Audits
          </h2>

          <p className="text-lg text-slate-400">
            Check every aspect of your
            application
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: 'Performance',
              description:
                'Analyze load times, rendering performance, and Core Web Vitals',
              icon: Zap,
            },
            {
              title: 'Accessibility',
              description:
                'Ensure WCAG compliance and screen reader compatibility',
              icon: Shield,
            },
            {
              title: 'Best Practices',
              description:
                'Check code quality, security headers, and modern standards',
              icon: Layers,
            },
            {
              title: 'Auto-Fix PRs',
              description:
                'Create pull requests to automatically fix common issues',
              icon: GitBranch,
            },
          ].map((feature, i) => {
            const Icon = feature.icon

            return (
              <div
                key={i}
                className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 h-fit">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* GitHub Integration */}
      <section className="space-y-8 py-16 md:py-24">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GitBranch className="h-6 w-6 text-emerald-500" />

              <h2 className="text-2xl md:text-3xl font-bold text-white">
                GitHub Integration
              </h2>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Install Orion on your GitHub
              account to automatically audit
              every push, pull request, and
              deployment.
            </p>

            <div className="pt-4">
              <a
                href="https://github.com/apps/orion-qa/installations/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  <GitBranch className="mr-2 h-4 w-4" />

                  Install GitHub App

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="space-y-8 py-16 md:py-24 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to improve your code quality?
          </h2>

          <p className="text-lg text-slate-400">
            Start with a manual audit today,
            or integrate with GitHub for
            continuous quality checks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/manual">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
            >
              Start Manual Audit

              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/runs">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 w-full sm:w-auto"
            >
              View All Runs

              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </DashboardShell>
  )
}