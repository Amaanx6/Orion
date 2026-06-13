import React from 'react'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#f8f9fb] to-[#f0f3f8] text-[#1a1f35]">
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        {children}
      </main>
    </div>
  )
}
