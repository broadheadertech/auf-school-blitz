import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2, AlertTriangle, Calculator } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BSCS_CURRICULUM, COMPLETED_SUBJECT_IDS, getNodeStatus } from '@/pages/curriculum/data'
import type { CurriculumEntryWithSubject } from '@/types/database'
import { estimateFees } from '../data'

const MAX_UNITS = 24

export function WhatIfPlanner() {
  const [cart, setCart] = useState<CurriculumEntryWithSubject[]>([])
  const [showSelector, setShowSelector] = useState(false)

  // Available subjects: not completed, not already in cart
  const availableSubjects = useMemo(() => {
    const cartIds = new Set(cart.map((c) => c.subject_id))
    return BSCS_CURRICULUM.filter(
      (entry) =>
        !COMPLETED_SUBJECT_IDS.has(entry.subject_id) &&
        !cartIds.has(entry.subject_id),
    )
  }, [cart])

  const totalUnits = cart.reduce((sum, c) => sum + c.subject.units, 0)
  const totalFees = estimateFees(totalUnits)
  const isOverloaded = totalUnits > MAX_UNITS

  // Check prerequisite warnings
  const getWarnings = useCallback(
    (entry: CurriculumEntryWithSubject): string[] => {
      const warnings: string[] = []
      for (const prereqId of entry.prerequisite_subject_ids) {
        if (!COMPLETED_SUBJECT_IDS.has(prereqId)) {
          const prereq = BSCS_CURRICULUM.find((c) => c.subject_id === prereqId)
          if (prereq) {
            warnings.push(`Requires ${prereq.subject.code} — not yet completed`)
          }
        }
      }
      return warnings
    },
    [],
  )

  const addToCart = useCallback((entry: CurriculumEntryWithSubject) => {
    setCart((prev) => [...prev, entry])
    setShowSelector(false)
  }, [])

  const removeFromCart = useCallback((subjectId: string) => {
    setCart((prev) => prev.filter((c) => c.subject_id !== subjectId))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            What If Planner
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Simulate your enrollment — no records created
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowSelector(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Subject
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className={`text-2xl font-bold ${isOverloaded ? 'text-[var(--color-error)]' : 'text-[var(--color-primary)]'}`}>
            {totalUnits}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Units</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{cart.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Subjects</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-accent)]">
            ₱{totalFees.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Est. Fees</p>
        </Card>
      </div>

      {isOverloaded && (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error)]/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
          <p className="text-sm text-[var(--color-error)]">
            Unit overload — maximum {MAX_UNITS} units recommended
          </p>
        </div>
      )}

      {/* Cart */}
      {cart.length === 0 ? (
        <Card className="text-center py-8">
          <Calculator className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Add subjects to simulate your enrollment
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {cart.map((entry) => {
            const warnings = getWarnings(entry)
            return (
              <Card key={entry.subject_id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {entry.subject.code}
                    </p>
                    <Badge variant="info" label={`${entry.subject.units} units`} />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{entry.subject.name}</p>
                  {warnings.map((w, i) => (
                    <p key={i} className="mt-1 flex items-center gap-1 text-xs text-[var(--color-warning)]">
                      <AlertTriangle className="h-3 w-3" />
                      {w}
                    </p>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(entry.subject_id)}
                  className="rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-error)]/10 transition-colors"
                  aria-label={`Remove ${entry.subject.code}`}
                >
                  <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
                </button>
              </Card>
            )
          })}
        </div>
      )}

      {/* Subject selector modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                Select Subject
              </h3>
              <Button variant="secondary" onClick={() => setShowSelector(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              {availableSubjects.map((entry) => {
                const status = getNodeStatus(entry.subject_id, entry.prerequisite_subject_ids)
                const warnings = getWarnings(entry)
                return (
                  <button
                    key={entry.subject_id}
                    type="button"
                    onClick={() => addToCart(entry)}
                    className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {entry.subject.code} — {entry.subject.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {entry.subject.units} units · Year {entry.year_level} {entry.semester}
                      </p>
                      {warnings.length > 0 && (
                        <p className="mt-1 text-xs text-[var(--color-warning)]">
                          {warnings[0]}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={status === 'available' ? 'success' : status === 'locked' ? 'neutral' : 'warning'}
                      label={status === 'available' ? 'Available' : status === 'locked' ? 'Locked' : 'In Progress'}
                    />
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
