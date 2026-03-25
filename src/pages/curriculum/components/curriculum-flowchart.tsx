import { useState } from 'react'
import { CheckCircle, Clock, Lock, BookOpen, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { CurriculumEntryWithSubject, CurriculumNodeStatus } from '@/types/database'
import { getNodeStatus, SUBJECT_GRADES } from '../data'

interface CurriculumFlowchartProps {
  curriculum: CurriculumEntryWithSubject[]
}

const STATUS_CONFIG: Record<CurriculumNodeStatus, {
  bg: string
  border: string
  text: string
  icon: typeof CheckCircle
  label: string
  badgeVariant: 'success' | 'warning' | 'info' | 'neutral'
}> = {
  completed: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    icon: CheckCircle,
    label: 'Completed',
    badgeVariant: 'success',
  },
  in_progress: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    icon: Clock,
    label: 'In Progress',
    badgeVariant: 'warning',
  },
  available: {
    bg: 'bg-white',
    border: 'border-[var(--color-border)]',
    text: 'text-[var(--color-text-primary)]',
    icon: BookOpen,
    label: 'Available',
    badgeVariant: 'info',
  },
  locked: {
    bg: 'bg-[var(--color-bg)]',
    border: 'border-[var(--color-border)]',
    text: 'text-[var(--color-text-secondary)]',
    icon: Lock,
    label: 'Locked',
    badgeVariant: 'neutral',
  },
}

interface SubjectNodeProps {
  entry: CurriculumEntryWithSubject
  status: CurriculumNodeStatus
  onSelect: (entry: CurriculumEntryWithSubject) => void
}

function SubjectNode({ entry, status, onSelect }: SubjectNodeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className={`w-full rounded-[var(--radius-lg)] border-2 ${config.border} ${config.bg} p-3 text-left transition-all duration-150 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1`}
      aria-label={`${entry.subject.code} ${entry.subject.name} — ${config.label}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${config.text}`}>
            {entry.subject.code}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
            {entry.subject.name}
          </p>
        </div>
        <Icon className={`h-4 w-4 shrink-0 ${config.text}`} aria-hidden="true" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-secondary)]">
          {entry.subject.units} units
        </span>
        <Badge variant={config.badgeVariant} label={config.label} />
      </div>
    </button>
  )
}

interface DetailsPanelProps {
  entry: CurriculumEntryWithSubject
  status: CurriculumNodeStatus
  curriculum: CurriculumEntryWithSubject[]
  onClose: () => void
}

function DetailsPanel({ entry, status, curriculum, onClose }: DetailsPanelProps) {
  const config = STATUS_CONFIG[status]
  const grade = SUBJECT_GRADES[entry.subject_id]
  const prereqs = entry.prerequisite_subject_ids
    .map((id) => curriculum.find((c) => c.subject_id === id))
    .filter(Boolean)

  return (
    <Card className="border-l-4" style={{ borderLeftColor: `var(--tw-border-opacity, ${config.border})` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            {entry.subject.code}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {entry.subject.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[var(--radius-md)] p-1 hover:bg-[var(--color-border)] transition-colors"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-[var(--color-text-primary)]">{entry.subject.units}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Units</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--color-text-primary)]">
            {entry.subject_type.toUpperCase()}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Type</p>
        </div>
        <div>
          <Badge variant={config.badgeVariant} label={config.label} />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Status</p>
        </div>
      </div>

      {grade !== undefined && (
        <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-2 text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">Final Grade</p>
          <p className={`text-xl font-bold ${grade <= 3.0 ? 'text-green-600' : 'text-red-600'}`}>
            {grade.toFixed(2)}
          </p>
        </div>
      )}

      {prereqs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Prerequisites:</p>
          <div className="flex flex-wrap gap-1">
            {prereqs.map((p) => (
              <span
                key={p!.subject_id}
                className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
              >
                {p!.subject.code}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export function CurriculumFlowchart({ curriculum }: CurriculumFlowchartProps) {
  const [selected, setSelected] = useState<CurriculumEntryWithSubject | null>(null)

  // Group by year and semester
  const grouped = new Map<string, CurriculumEntryWithSubject[]>()
  for (const entry of curriculum) {
    const key = `Year ${entry.year_level} — ${entry.semester}`
    const existing = grouped.get(key) ?? []
    existing.push(entry)
    grouped.set(key, existing)
  }

  return (
    <div className="space-y-4">
      {selected && (
        <DetailsPanel
          entry={selected}
          status={getNodeStatus(selected.subject_id, selected.prerequisite_subject_ids)}
          curriculum={curriculum}
          onClose={() => setSelected(null)}
        />
      )}

      {Array.from(grouped.entries()).map(([label, entries]) => (
        <div key={label}>
          <h3 className="mb-2 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            {label}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {entries.map((entry) => (
              <SubjectNode
                key={entry.id}
                entry={entry}
                status={getNodeStatus(entry.subject_id, entry.prerequisite_subject_ids)}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] px-4 py-3">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Legend:</span>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <config.icon className={`h-3.5 w-3.5 ${config.text}`} aria-hidden="true" />
            <span className="text-xs text-[var(--color-text-secondary)]">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
