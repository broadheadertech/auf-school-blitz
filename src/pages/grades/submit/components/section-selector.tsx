import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export interface FacultySection {
  id: string
  section_code: string
  subject_id: string
  semester: string
  academic_year: string
  enrolled_count: number
  schedule_json: { day: string; start: string; end: string; room: string }[]
  subjects?: { code: string; name: string; units: number } | null
}

function formatSchedule(schedule: FacultySection['schedule_json']): string {
  if (!schedule || schedule.length === 0) return 'No schedule'
  return schedule.map((s) => `${s.day} ${s.start}-${s.end}`).join(', ')
}

interface SectionSelectorProps {
  sections: FacultySection[]
  loading: boolean
  selectedSectionId: string | null
  onSelect: (sectionId: string) => void
}

export function SectionSelector({
  sections,
  loading,
  selectedSectionId,
  onSelect,
}: SectionSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="section-select"
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Select Section
      </label>
      {loading ? (
        <div className="flex items-center gap-2 py-3 text-sm text-[var(--color-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your sections...
        </div>
      ) : sections.length === 0 ? (
        <p className="py-3 text-sm text-[var(--color-text-secondary)]">
          No sections assigned. Contact your department head.
        </p>
      ) : (
        <select
          id="section-select"
          value={selectedSectionId ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="" disabled>
            -- Choose a section --
          </option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.section_code} - {section.subjects?.name ?? 'Unknown Subject'}
            </option>
          ))}
        </select>
      )}
      {selectedSectionId && (
        <Card className="mt-2">
          {(() => {
            const section = sections.find((s) => s.id === selectedSectionId)
            if (!section) return null
            return (
              <div className="flex flex-col gap-1">
                <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                  {section.subjects?.code ?? '?'} - {section.subjects?.name ?? 'Unknown Subject'}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Section {section.section_code} &middot; {formatSchedule(section.schedule_json)}{' '}
                  &middot; {section.enrolled_count} students
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {section.semester} &middot; AY {section.academic_year}
                </p>
              </div>
            )
          })()}
        </Card>
      )}
    </div>
  )
}
