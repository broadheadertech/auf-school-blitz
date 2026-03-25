import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type EnrollmentStatus = 'OPEN' | 'CLOSED'

interface EnrollmentPeriod {
  semester: string
  academicYear: string
  status: EnrollmentStatus
  dateRange: string
}

// Mock data for MVP — will be replaced with DB query in future story
const MOCK_ENROLLMENT: EnrollmentPeriod = {
  semester: '1st Sem',
  academicYear: 'AY 2026-2027',
  status: 'OPEN',
  dateRange: 'Freshmen: Aug 5–9 | Continuing: Aug 12–16',
}

export function EnrollmentBanner() {
  const { semester, academicYear, status, dateRange } = MOCK_ENROLLMENT
  const isOpen = status === 'OPEN'

  return (
    <Card className="mb-4 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isOpen
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'bg-[var(--color-text-secondary)]/10 text-[var(--color-text-secondary)]'
          }`}
        >
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              Enrollment for {semester} {academicYear}
            </span>
            <Badge
              variant={isOpen ? 'success' : 'info'}
              label={status}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {dateRange}
          </p>
        </div>
      </div>
    </Card>
  )
}
