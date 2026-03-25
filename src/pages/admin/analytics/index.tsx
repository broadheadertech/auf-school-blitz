/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import type { BadgeVariant } from '@/components/ui/badge'

const db = supabase as any

interface ProgramStats {
  program: string
  count: number
  avgGwa: number
}

interface GwaDistribution {
  range: string
  count: number
}

interface PaymentBreakdown {
  status: string
  count: number
}

interface SemesterTrend {
  semester: string
  academic_year: string
  count: number
}

export default function AnalyticsDashboardPage() {
  const { role } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [programStats, setProgramStats] = useState<ProgramStats[]>([])
  const [gwaDistribution, setGwaDistribution] = useState<GwaDistribution[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([])
  const [enrollmentTrend, setEnrollmentTrend] = useState<SemesterTrend[]>([])
  const [enrollmentRate, setEnrollmentRate] = useState(0)
  const [paymentCollectionRate, setPaymentCollectionRate] = useState(0)

  useEffect(() => {
    if (role !== 'admin') return
    ;(async () => {
      try {
        await Promise.all([
          fetchStudentStats(),
          fetchGwaDistribution(),
          fetchPaymentBreakdown(),
          fetchEnrollmentTrend(),
        ])
      } catch (err) {
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [role])

  async function fetchStudentStats() {
    // Fetch all students with their program
    const { data: students } = await db.from('students').select('id, program')
    if (!students) return

    setTotalStudents(students.length)

    // Group by program
    const programMap: Record<string, number> = {}
    for (const s of students) {
      const prog = s.program ?? 'Unknown'
      programMap[prog] = (programMap[prog] ?? 0) + 1
    }

    // Fetch grades to compute average GWA per program
    const { data: grades } = await db.from('grades').select('student_id, final_computed')
    const studentGrades: Record<string, number[]> = {}
    for (const g of grades ?? []) {
      if (g.final_computed != null) {
        if (!studentGrades[g.student_id]) studentGrades[g.student_id] = []
        studentGrades[g.student_id]!.push(Number(g.final_computed))
      }
    }

    // Compute per-student GWA, then average by program
    const studentProgram: Record<string, string> = {}
    for (const s of students) studentProgram[s.id] = s.program ?? 'Unknown'

    const programGwas: Record<string, number[]> = {}
    for (const [studentId, gradeList] of Object.entries(studentGrades)) {
      const prog = studentProgram[studentId] ?? 'Unknown'
      const studentGwa = gradeList.reduce((a, b) => a + b, 0) / gradeList.length
      if (!programGwas[prog]) programGwas[prog] = []
      programGwas[prog]!.push(studentGwa)
    }

    const stats: ProgramStats[] = Object.entries(programMap).map(([program, count]) => ({
      program,
      count,
      avgGwa: programGwas[program]
        ? Number((programGwas[program]!.reduce((a, b) => a + b, 0) / programGwas[program]!.length).toFixed(2))
        : 0,
    }))
    stats.sort((a, b) => b.count - a.count)

    setProgramStats(stats)

    // Enrollment rate: students with at least one confirmed enrollment / total students
    const { data: enrollments } = await db.from('enrollments').select('student_id').eq('status', 'confirmed')
    const enrolledStudentIds = new Set((enrollments ?? []).map((e: any) => e.student_id))
    setEnrollmentRate(students.length > 0 ? Math.round((enrolledStudentIds.size / students.length) * 100) : 0)
  }

  async function fetchGwaDistribution() {
    const { data: grades } = await db.from('grades').select('student_id, final_computed')
    if (!grades || grades.length === 0) {
      setGwaDistribution([])
      return
    }

    // Compute per-student GWA
    const studentGrades: Record<string, number[]> = {}
    for (const g of grades) {
      if (g.final_computed != null) {
        if (!studentGrades[g.student_id]) studentGrades[g.student_id] = []
        studentGrades[g.student_id]!.push(Number(g.final_computed))
      }
    }

    const ranges: GwaDistribution[] = [
      { range: '< 1.5', count: 0 },
      { range: '1.5 - 2.0', count: 0 },
      { range: '2.0 - 2.5', count: 0 },
      { range: '2.5 - 3.0', count: 0 },
      { range: '> 3.0', count: 0 },
    ]

    for (const gradeList of Object.values(studentGrades)) {
      const gwa = gradeList.reduce((a, b) => a + b, 0) / gradeList.length
      if (gwa < 1.5) ranges[0]!.count++
      else if (gwa < 2.0) ranges[1]!.count++
      else if (gwa < 2.5) ranges[2]!.count++
      else if (gwa <= 3.0) ranges[3]!.count++
      else ranges[4]!.count++
    }

    setGwaDistribution(ranges)
  }

  async function fetchPaymentBreakdown() {
    const { data: payments } = await db.from('payments').select('status')
    if (!payments || payments.length === 0) {
      setPaymentBreakdown([])
      return
    }

    const statusMap: Record<string, number> = {}
    for (const p of payments) {
      const st = p.status ?? 'unknown'
      statusMap[st] = (statusMap[st] ?? 0) + 1
    }

    const breakdown: PaymentBreakdown[] = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    setPaymentBreakdown(breakdown)

    // Collection rate: verified / total
    const totalPayments = payments.length
    const verifiedCount = statusMap['verified'] ?? 0
    setPaymentCollectionRate(totalPayments > 0 ? Math.round((verifiedCount / totalPayments) * 100) : 0)
  }

  async function fetchEnrollmentTrend() {
    const { data: enrollments } = await db
      .from('enrollments')
      .select('semester, academic_year')
      .eq('status', 'confirmed')

    if (!enrollments || enrollments.length === 0) {
      setEnrollmentTrend([])
      return
    }

    const trendMap: Record<string, number> = {}
    for (const e of enrollments) {
      const key = `${e.semester} ${e.academic_year}`
      trendMap[key] = (trendMap[key] ?? 0) + 1
    }

    const trend: SemesterTrend[] = Object.entries(trendMap)
      .map(([key, count]) => {
        const parts = key.split(' ')
        return { semester: parts[0] ?? key, academic_year: parts.slice(1).join(' '), count }
      })
      .sort((a, b) => {
        // Sort by academic year then semester
        const yearCompare = a.academic_year.localeCompare(b.academic_year)
        if (yearCompare !== 0) return yearCompare
        return a.semester.localeCompare(b.semester)
      })

    setEnrollmentTrend(trend)
  }

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Analytics is only accessible to administrators.
        </p>
      </div>
    )
  }

  if (loading) {
    return <PageSkeleton />
  }

  const overallAvgGwa = programStats.length > 0
    ? (programStats.reduce((sum, p) => sum + p.avgGwa * p.count, 0) / programStats.reduce((sum, p) => sum + p.count, 0)).toFixed(2)
    : '—'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Overview of school performance metrics
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalStudents}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Total Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-green-50">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{overallAvgGwa}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Avg GWA</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-amber-50">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{enrollmentRate}%</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Enrollment Rate</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-purple-50">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{paymentCollectionRate}%</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Payment Collection</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row 1: Students per program + GWA distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students per Program — horizontal bar chart */}
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Students per Program
          </h3>
          {programStats.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No student data available.</p>
          ) : (
            <div className="space-y-3">
              {programStats.map((p) => {
                const maxCount = Math.max(...programStats.map((s) => s.count))
                const widthPercent = maxCount > 0 ? (p.count / maxCount) * 100 : 0
                return (
                  <div key={p.program}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{p.program}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-text-secondary)]">Avg GWA: {p.avgGwa || '—'}</span>
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">{p.count}</span>
                      </div>
                    </div>
                    <div className="h-6 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-border)]">
                      <div
                        className="h-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* GWA Distribution — histogram-style bars */}
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            GWA Distribution
          </h3>
          {gwaDistribution.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No grade data available.</p>
          ) : (
            <div className="flex items-end gap-2" style={{ height: '180px' }}>
              {gwaDistribution.map((d) => {
                const maxCount = Math.max(...gwaDistribution.map((g) => g.count))
                const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0
                const colors = [
                  'bg-green-500',   // < 1.5
                  'bg-blue-500',    // 1.5 - 2.0
                  'bg-amber-500',   // 2.0 - 2.5
                  'bg-orange-500',  // 2.5 - 3.0
                  'bg-red-500',     // > 3.0
                ]
                const colorIdx = gwaDistribution.indexOf(d)
                return (
                  <div key={d.range} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{d.count}</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                      <div
                        className={`w-full rounded-t-[var(--radius-sm)] ${colors[colorIdx] ?? 'bg-gray-400'} transition-all duration-500`}
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] text-center leading-tight">
                      {d.range}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Charts row 2: Payment breakdown + Enrollment trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Status Breakdown */}
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Payment Status Breakdown
          </h3>
          {paymentBreakdown.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No payment data available.</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const statusColors: Record<string, string> = {
                  verified: 'bg-green-500',
                  posted: 'bg-blue-500',
                  uploaded: 'bg-blue-400',
                  pending: 'bg-amber-500',
                  under_review: 'bg-amber-400',
                  rejected: 'bg-red-500',
                }
                const statusBadgeVariant: Record<string, BadgeVariant> = {
                  verified: 'success',
                  posted: 'info',
                  uploaded: 'info',
                  pending: 'warning',
                  under_review: 'warning',
                  rejected: 'error',
                }
                const maxCount = Math.max(...paymentBreakdown.map((p) => p.count))
                const totalPayments = paymentBreakdown.reduce((sum, p) => sum + p.count, 0)

                return paymentBreakdown.map((p) => {
                  const widthPercent = maxCount > 0 ? (p.count / maxCount) * 100 : 0
                  const percentage = totalPayments > 0 ? Math.round((p.count / totalPayments) * 100) : 0
                  return (
                    <div key={p.status}>
                      <div className="mb-1 flex items-center justify-between">
                        <Badge
                          variant={statusBadgeVariant[p.status] ?? 'neutral'}
                          label={p.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        />
                        <span className="text-sm text-[var(--color-text-primary)]">
                          <span className="font-bold">{p.count}</span>
                          <span className="ml-1 text-xs text-[var(--color-text-secondary)]">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-5 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-border)]">
                        <div
                          className={`h-full rounded-[var(--radius-sm)] ${statusColors[p.status] ?? 'bg-gray-400'} transition-all duration-500`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </Card>

        {/* Enrollment Trend per Semester */}
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Enrollment Trend per Semester
          </h3>
          {enrollmentTrend.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No enrollment data available.</p>
          ) : (
            <div className="flex items-end gap-2" style={{ height: '180px' }}>
              {enrollmentTrend.map((t) => {
                const maxCount = Math.max(...enrollmentTrend.map((e) => e.count))
                const heightPercent = maxCount > 0 ? (t.count / maxCount) * 100 : 0
                return (
                  <div key={`${t.semester}-${t.academic_year}`} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{t.count}</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                      <div
                        className="w-full rounded-t-[var(--radius-sm)] bg-[var(--color-primary)] transition-all duration-500"
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-[var(--color-text-primary)] leading-tight">{t.semester}</p>
                      <p className="text-[9px] text-[var(--color-text-secondary)] leading-tight">{t.academic_year}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Detailed program stats table */}
      <Card>
        <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
          Students by Program — Detailed
        </h3>
        {programStats.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)]">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 text-left font-semibold text-[var(--color-text-secondary)]">Program</th>
                  <th className="py-2 text-right font-semibold text-[var(--color-text-secondary)]">Students</th>
                  <th className="py-2 text-right font-semibold text-[var(--color-text-secondary)]">% of Total</th>
                  <th className="py-2 text-right font-semibold text-[var(--color-text-secondary)]">Avg GWA</th>
                </tr>
              </thead>
              <tbody>
                {programStats.map((p) => (
                  <tr key={p.program} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 font-semibold text-[var(--color-text-primary)]">{p.program}</td>
                    <td className="py-2 text-right text-[var(--color-text-primary)]">{p.count}</td>
                    <td className="py-2 text-right text-[var(--color-text-secondary)]">
                      {totalStudents > 0 ? Math.round((p.count / totalStudents) * 100) : 0}%
                    </td>
                    <td className="py-2 text-right">
                      {p.avgGwa > 0 ? (
                        <Badge
                          variant={p.avgGwa <= 1.75 ? 'success' : p.avgGwa <= 2.5 ? 'info' : p.avgGwa <= 3.0 ? 'warning' : 'error'}
                          label={String(p.avgGwa)}
                        />
                      ) : (
                        <span className="text-[var(--color-text-secondary)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
