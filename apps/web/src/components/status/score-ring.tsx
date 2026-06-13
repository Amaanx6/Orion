'use client'

import { useEffect, useState } from 'react'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animated?: boolean
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  animated = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    if (!animated) return

    const duration = 1000
    const startTime = Date.now()

    const animateScore = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayScore(Math.round(score * progress))

      if (progress < 1) {
        requestAnimationFrame(animateScore)
      } else {
        setDisplayScore(score)
      }
    }

    animateScore()
  }, [score, animated])

  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.1))' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(100, 116, 139, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-300 ${color}`}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{displayScore}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-slate-300">{getScoreLabel(score)}</div>
        <div className="text-xs text-slate-500">{score >= 70 ? 'Passed' : 'Failed'}</div>
      </div>
    </div>
  )
}
