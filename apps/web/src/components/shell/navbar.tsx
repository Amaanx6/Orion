'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

import {
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react'

import { Button } from '../../components/ui/'

export function Navbar() {
  const { theme, setTheme } = useTheme()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                O
              </span>
            </div>

            <span className="hidden sm:inline">
              Orion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/runs"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Runs
            </Link>

            <Link
              href="/repos"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Repositories
            </Link>

            <Link
              href="/manual"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Manual Audit
            </Link>

            <Link
              href="/settings"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}

              <span className="sr-only">
                Toggle theme
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="md:hidden text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}

              <span className="sr-only">
                Toggle menu
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 py-4 space-y-2">
            <Link
              href="/runs"
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              Runs
            </Link>

            <Link
              href="/repos"
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              Repositories
            </Link>

            <Link
              href="/manual"
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              Manual Audit
            </Link>

            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              Settings
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}