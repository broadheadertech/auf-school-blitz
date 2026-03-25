import { useEffect } from 'react'
import { Flame, Trophy, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useStreakStore } from '@/stores/streak-store'

const MILESTONES = [
  { days: 7, label: '7-Day', icon: Flame, color: '#CD7F32' }, // Bronze
  { days: 30, label: '30-Day', icon: Trophy, color: '#C0C0C0' }, // Silver
  { days: 100, label: '100-Day', icon: Award, color: '#FFD700' }, // Gold
]

export function StreakWidget() {
  const { currentStreak, longestStreak, todayCheckedIn, recordCheckIn } = useStreakStore()

  // Auto check-in on mount (first page load of the day)
  useEffect(() => {
    if (!todayCheckedIn) recordCheckIn()
  }, [todayCheckedIn, recordCheckIn])

  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500">
        <Flame className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {currentStreak}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">day streak</span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Best: {longestStreak} days
        </p>
      </div>
      {/* Milestone badges */}
      <div className="flex gap-1.5">
        {MILESTONES.map((m) => {
          const earned = longestStreak >= m.days
          return (
            <div
              key={m.days}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                earned ? 'shadow-sm' : 'opacity-30'
              }`}
              style={{ backgroundColor: earned ? m.color : 'var(--color-border)' }}
              title={`${m.label} streak${earned ? ' (earned!)' : ''}`}
            >
              <m.icon className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
