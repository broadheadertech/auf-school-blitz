import { useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TimeBlock } from '@/types/database'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7AM to 8PM

interface ScheduleCanvasProps {
  selected: TimeBlock[]
  onChange: (blocks: TimeBlock[]) => void
}

export function ScheduleCanvas({ selected, onChange }: ScheduleCanvasProps) {
  const isSelected = useCallback(
    (day: string, hour: number) =>
      selected.some((b) => b.day === day && b.hour === hour),
    [selected],
  )

  const toggle = useCallback(
    (day: string, hour: number) => {
      const exists = selected.some((b) => b.day === day && b.hour === hour)
      if (exists) {
        onChange(selected.filter((b) => !(b.day === day && b.hour === hour)))
      } else {
        onChange([...selected, { day, hour }])
      }
    },
    [selected, onChange],
  )

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Schedule Preferences
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Tap time blocks when you&apos;re available for classes
          </p>
        </div>
        <Button variant="secondary" onClick={() => onChange([])}>
          Clear
        </Button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[500px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-0.5 mb-0.5">
            <div />
            {DAYS.map((day) => (
              <div
                key={day}
                className="rounded-t-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-1.5 text-center text-xs font-semibold text-white"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] gap-0.5 mb-0.5">
              <div className="flex items-center justify-end pr-2 text-xs text-[var(--color-text-secondary)]">
                {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
              </div>
              {DAYS.map((day) => {
                const sel = isSelected(day, hour)
                return (
                  <button
                    key={`${day}-${hour}`}
                    type="button"
                    onClick={() => toggle(day, hour)}
                    aria-label={`${day} ${hour}:00 ${sel ? 'selected' : 'not selected'}`}
                    aria-pressed={sel}
                    className={`h-8 rounded-[var(--radius-sm)] border transition-all duration-100 ${
                      sel
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border)]'
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          {selected.length} time block{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </Card>
  )
}
