import { useState, useCallback } from 'react'
import { CalendarClock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import type { TimeBlock, Section } from '@/types/database'
import { ScheduleCanvas } from './components/schedule-canvas'
import { SubjectCard } from './components/subject-card'
import { EnrollmentSummary } from './components/enrollment-summary'
import { WhatIfPlanner } from './components/what-if-planner'
import { EnrollmentHeatmap } from './components/enrollment-heatmap'
import { AVAILABLE_SECTIONS, ENROLLMENT_STATUS, schedulesConflict } from './data'
import { useSections, useAcademicSettings } from '@/hooks/use-supabase-query'

type SelectedSection = Section & { subject: { code: string; name: string; units: number } }
type EnrollStep = 'preferences' | 'select' | 'summary'

export default function EnrollmentPage() {
  const { role } = useAuthStore()
  const [step, setStep] = useState<EnrollStep>('preferences')
  const [timePrefs, setTimePrefs] = useState<TimeBlock[]>([])
  const [cart, setCart] = useState<SelectedSection[]>([])

  // Live data from DB with fallback to mock
  const { sections: liveSections, loading: sectionsLoading } = useSections()
  const { settings, loading: settingsLoading } = useAcademicSettings()
  const availableSections = liveSections.length > 0 ? liveSections : AVAILABLE_SECTIONS
  const rawStatus = settings.enrollment_status
  const enrollmentOpen = rawStatus ? rawStatus.replace(/"/g, '') === 'open' : ENROLLMENT_STATUS.isOpen
  const currentSem = (settings.current_semester || ENROLLMENT_STATUS.semester).replace(/"/g, '')
  const currentAY = (settings.current_academic_year || ENROLLMENT_STATUS.academicYear).replace(/"/g, '')

  if (sectionsLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <h1>Enrollment</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!enrollmentOpen) {
    return (
      <div className="space-y-6">
        <h1>Enrollment</h1>
        <Card className="text-center py-8">
          <CalendarClock className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Enrollment is Currently Closed
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Next enrollment window: January 5-20, 2026
          </p>
        </Card>
        <WhatIfPlanner />
      </div>
    )
  }

  if (role === 'admin') {
    return <AdminSectionView />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Enrollment</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {currentSem} AY {currentAY}
          </p>
        </div>
        <Badge variant="success" label="Open" />
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {(['preferences', 'select', 'summary'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step === s
                  ? 'bg-[var(--color-primary)] text-white'
                  : i < ['preferences', 'select', 'summary'].indexOf(step)
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="h-0.5 w-8 bg-[var(--color-border)]" />}
          </div>
        ))}
        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
          {step === 'preferences' ? 'Set Schedule' : step === 'select' ? 'Choose Subjects' : 'Review & Confirm'}
        </span>
      </div>

      {step === 'preferences' && (
        <PreferencesStep timePrefs={timePrefs} onChange={setTimePrefs} onNext={() => setStep('select')} />
      )}

      {step === 'select' && (
        <SelectionStep cart={cart} onCartChange={setCart} onBack={() => setStep('preferences')} onNext={() => setStep('summary')} sections={availableSections} />
      )}

      {step === 'summary' && (
        <EnrollmentSummary selected={cart} onEdit={() => setStep('select')} onConfirm={() => {}} semester={currentSem} academicYear={currentAY} />
      )}

      <WhatIfPlanner />
    </div>
  )
}

function PreferencesStep({ timePrefs, onChange, onNext }: { timePrefs: TimeBlock[]; onChange: (b: TimeBlock[]) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <ScheduleCanvas selected={timePrefs} onChange={onChange} />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
        >
          Continue to Subject Selection
        </button>
      </div>
    </div>
  )
}

function SelectionStep({ cart, onCartChange, onBack, onNext, sections: sectionList }: { cart: SelectedSection[]; onCartChange: (c: SelectedSection[]) => void; onBack: () => void; onNext: () => void; sections: typeof AVAILABLE_SECTIONS }) {
  const addToCart = useCallback((section: SelectedSection) => onCartChange([...cart, section]), [cart, onCartChange])
  const removeFromCart = useCallback((sectionId: string) => onCartChange(cart.filter((s) => s.id !== sectionId)), [cart, onCartChange])

  const getConflict = useCallback(
    (section: (typeof AVAILABLE_SECTIONS)[number]): string | null => {
      for (const selected of cart) {
        if (selected.id === section.id) continue
        if (schedulesConflict(selected.schedule_json, section.schedule_json)) return selected.subject.code
      }
      return null
    },
    [cart],
  )

  const totalUnits = cart.reduce((sum, s) => sum + s.subject.units, 0)

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">{cart.length} subject{cart.length !== 1 ? 's' : ''} selected</span>
          <span className="ml-3 text-sm text-[var(--color-text-secondary)]">{totalUnits} units</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-border)]">
            Back
          </button>
          <button type="button" onClick={onNext} disabled={cart.length === 0} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)] disabled:opacity-50">
            Review
          </button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {sectionList.map((section) => {
          const isInCart = cart.some((s) => s.id === section.id)
          const conflict = isInCart ? null : getConflict(section)
          return (
            <SubjectCard key={section.id} section={section} conflictWith={conflict} isSelected={isInCart} onAdd={() => addToCart(section)} onRemove={() => removeFromCart(section.id)} />
          )
        })}
      </div>
    </div>
  )
}

function AdminSectionView() {
  const { sections: liveSections } = useSections()
  const sections = liveSections.length > 0 ? liveSections : AVAILABLE_SECTIONS

  return (
    <div className="space-y-6">
      <h1>Section Management</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">Manage sections, capacity, and enrollment fill rates.</p>
      <EnrollmentHeatmap />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const fillPercent = Math.round((section.enrolled_count / section.capacity) * 100)
          const fillVariant = fillPercent > 90 ? ('error' as const) : fillPercent > 70 ? ('warning' as const) : ('success' as const)
          return (
            <Card key={section.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">{section.subject.code}</p>
                <Badge variant={fillVariant} label={`${fillPercent}%`} />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">{section.section_code}</p>
              <div className="mt-2 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${fillPercent}%`, backgroundColor: fillPercent > 90 ? 'var(--color-error)' : fillPercent > 70 ? 'var(--color-warning)' : 'var(--color-success)' }} />
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{section.enrolled_count}/{section.capacity} enrolled</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
