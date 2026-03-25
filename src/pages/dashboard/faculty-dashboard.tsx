/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, AlertTriangle, ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WelcomeBanner } from './components/welcome-banner'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export function FacultyDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [sections, setSections] = useState<any[]>([])
  const [atRiskCount, setAtRiskCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // Get faculty ID
      const { data: facultyRow } = await (db.from('faculty').select('id').eq('user_id', user.id).maybeSingle())
      if (!facultyRow) { setLoading(false); return }

      // Get sections with student counts
      const { data: secs } = await db.from('sections').select('*, subjects(code, name, units)').eq('faculty_id', facultyRow.id).order('section_code')
      if (secs) setSections(secs)

      // Get at-risk students (midterm >= 3.0) in my sections
      const sectionIds = secs?.map((s: any) => s.id) ?? []
      if (sectionIds.length > 0) {
        const { data: grades } = await db.from('grades').select('midterm').in('section_id', sectionIds).gte('midterm', 3.0).not('midterm', 'is', null)
        setAtRiskCount(grades?.length ?? 0)
      }

      setLoading(false)
    })()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <WelcomeBanner />
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-info)]/10">
            <BookOpen className="h-5 w-5 text-[var(--color-info)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{sections.length}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">My Sections</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <Users className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {sections.reduce((sum: number, s: any) => sum + (s.enrolled_count ?? 0), 0)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Total Students</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
            <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{atRiskCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">At-Risk Students</p>
          </div>
        </Card>
      </div>

      {/* Grade submission CTA */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <ClipboardList className="h-5 w-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">Grade Submission</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Submit and manage grades for your sections</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate('/grades/submit')}>Submit Grades</Button>
      </Card>

      {/* My Sections */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-[var(--color-text-primary)]">My Sections</h2>
        {sections.length === 0 ? (
          <Card className="text-center py-6">
            <p className="text-sm text-[var(--color-text-secondary)]">No sections assigned to you this semester.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sections.map((s: any) => {
              const fill = s.capacity > 0 ? Math.round((s.enrolled_count / s.capacity) * 100) : 0
              const schedule = Array.isArray(s.schedule_json) ? s.schedule_json : []

              return (
                <Card key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                        {s.subjects?.code} — {s.section_code}
                      </p>
                      <Badge variant={s.status === 'open' ? 'success' : 'error'} label={s.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{s.subjects?.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {schedule.map((sc: any) => `${sc.day} ${sc.start}-${sc.end} (${sc.room})`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{s.enrolled_count}/{s.capacity}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{fill}% full</p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
