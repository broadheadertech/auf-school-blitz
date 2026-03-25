import { Users, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Section } from '@/types/database'
import { formatSchedule } from '../data'

interface SubjectCardProps {
  section: Section & { subject: { code: string; name: string; units: number } }
  conflictWith: string | null
  isSelected: boolean
  onAdd: () => void
  onRemove: () => void
}

export function SubjectCard({ section, conflictWith, isSelected, onAdd, onRemove }: SubjectCardProps) {
  const fillPercent = Math.round((section.enrolled_count / section.capacity) * 100)
  const isFull = section.enrolled_count >= section.capacity
  const fillColor = fillPercent > 90 ? 'var(--color-error)' : fillPercent > 70 ? 'var(--color-warning)' : 'var(--color-success)'
  const disabled = !!conflictWith || isFull

  return (
    <div
      className={`rounded-[var(--radius-lg)] border p-4 transition-all duration-150 ${
        isSelected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-sm'
          : disabled
            ? 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-60'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
              {section.subject.code}
            </p>
            <Badge
              variant={isSelected ? 'success' : 'info'}
              label={section.section_code}
            />
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {section.subject.name} ({section.subject.units} units)
          </p>
        </div>
        {isSelected ? (
          <Button variant="secondary" onClick={onRemove}>
            Remove
          </Button>
        ) : (
          <Button variant="primary" onClick={onAdd} disabled={disabled}>
            {isFull ? 'Full' : 'Add'}
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatSchedule(section.schedule_json)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {section.enrolled_count}/{section.capacity}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPercent}%`, backgroundColor: fillColor }}
          />
        </div>
        <span className="text-[var(--color-text-secondary)]">{fillPercent}%</span>
      </div>

      {conflictWith && (
        <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-error)]">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Conflicts with {conflictWith}
        </div>
      )}
    </div>
  )
}
