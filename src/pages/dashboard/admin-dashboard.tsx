/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Users, BookOpen, Wallet, CalendarPlus, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WelcomeBanner } from './components/welcome-banner'
import { supabase } from '@/lib/supabase'

const db = supabase as any

interface DashboardStats {
  totalStudents: number
  totalFaculty: number
  totalSections: number
  openSections: number
  totalSubjects: number
  totalPrograms: number
  pendingPayments: number
  totalFeesCollected: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [sectionFills, setSectionFills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [studentsRes, facultyRes, sectionsRes, subjectsRes, programsRes, paymentsRes, recentRes, fillRes] = await Promise.all([
        db.from('students').select('id', { count: 'exact', head: true }),
        db.from('faculty').select('id', { count: 'exact', head: true }),
        db.from('sections').select('id, status', { count: 'exact' }),
        db.from('subjects').select('id', { count: 'exact', head: true }),
        db.from('programs').select('id', { count: 'exact', head: true }),
        db.from('payments').select('amount, status'),
        db.from('students').select('first_name, last_name, student_number, program, year_level, created_at').order('created_at', { ascending: false }).limit(5),
        db.from('sections').select('section_code, capacity, enrolled_count, status, subjects(code, name)').order('section_code').limit(10),
      ])

      const openSections = sectionsRes.data?.filter((s: any) => s.status === 'open').length ?? 0
      const pendingPayments = paymentsRes.data?.filter((p: any) => p.status === 'uploaded' || p.status === 'under_review').length ?? 0
      const totalCollected = paymentsRes.data?.filter((p: any) => p.status === 'posted' || p.status === 'verified').reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0

      setStats({
        totalStudents: studentsRes.count ?? 0,
        totalFaculty: facultyRes.count ?? 0,
        totalSections: sectionsRes.count ?? sectionsRes.data?.length ?? 0,
        openSections,
        totalSubjects: subjectsRes.count ?? 0,
        totalPrograms: programsRes.count ?? 0,
        pendingPayments,
        totalFeesCollected: totalCollected,
      })

      if (recentRes.data) setRecentStudents(recentRes.data)
      if (fillRes.data) setSectionFills(fillRes.data)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <WelcomeBanner />
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'var(--color-primary)' },
    { label: 'Faculty', value: stats?.totalFaculty ?? 0, icon: BookOpen, color: 'var(--color-info)' },
    { label: 'Sections', value: `${stats?.openSections ?? 0}/${stats?.totalSections ?? 0}`, icon: CalendarPlus, color: 'var(--color-success)', sub: 'open' },
    { label: 'Subjects', value: stats?.totalSubjects ?? 0, icon: BookOpen, color: 'var(--color-accent)' },
    { label: 'Programs', value: stats?.totalPrograms ?? 0, icon: TrendingUp, color: 'var(--color-info)' },
    { label: 'Pending Payments', value: stats?.pendingPayments ?? 0, icon: AlertTriangle, color: stats?.pendingPayments ? 'var(--color-warning)' : 'var(--color-success)' },
    { label: 'Fees Collected', value: `₱${((stats?.totalFeesCollected ?? 0) / 1000).toFixed(0)}K`, icon: Wallet, color: 'var(--color-success)' },
  ]

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${s.color} 15%, transparent)` }}
            >
              <s.icon className="h-5 w-5" style={{ color: s.color }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent students */}
        <Card>
          <h2 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Recent Students
          </h2>
          {recentStudents.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No students registered yet.</p>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.last_name}, {s.first_name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{s.student_number} — {s.program} Year {s.year_level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section fill rates */}
        <Card>
          <h2 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Section Fill Rates
          </h2>
          {sectionFills.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No sections created yet.</p>
          ) : (
            <div className="space-y-2">
              {sectionFills.map((s: any, i: number) => {
                const fill = s.capacity > 0 ? Math.round((s.enrolled_count / s.capacity) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                          {s.subjects?.code ?? '?'} {s.section_code}
                        </p>
                        <Badge variant={s.status === 'open' ? 'success' : 'error'} label={s.status} />
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${fill}%`,
                            backgroundColor: fill > 90 ? 'var(--color-error)' : fill > 70 ? 'var(--color-warning)' : 'var(--color-success)',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                      {s.enrolled_count}/{s.capacity}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
