import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FindingSeverity, RunStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format seconds to duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

/**
 * Get color class for severity badge
 */
export function getSeverityColor(severity: FindingSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-amber-500 text-white'
    case 'low':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

/**
 * Get color class for status badge
 */
export function getStatusColor(status: RunStatus): string {
  switch (status) {
    case 'running':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'completed':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'failed':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'pending':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

/**
 * Get pass/fail text for score
 */
export function getScoreLabel(score: number): string {
  return score >= 70 ? 'Pass' : 'Fail'
}

/**
 * Get pass/fail color for score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 70) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}
