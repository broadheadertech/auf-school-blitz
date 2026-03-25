import { useState, useEffect, useCallback, useMemo } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const db = supabase as any

interface LeaderboardEntry {
  student_id: string
  student_name: string
  program: string
  gwa: number
}

const PROGRAMS = ['All', 'BSCS', 'BSIT', 'BSN', 'BSBA'] as const
type ProgramFilter = (typeof PROGRAMS)[number]

const MEDAL_COLORS: Record<number, string> = {
  1: '#FFD700', // gold
  2: '#C0C0C0', // silver
  3: '#CD7F32', // bronze
}

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('All')

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all students with their grades to compute GWA
      const { data: students } = await db
        .from('students')
        .select('id, user_id, first_name, last_name, program')

      const { data: grades } = await db.from('grades').select('*')

      if (students && grades) {
        const leaderboard: LeaderboardEntry[] = []

        for (const student of students) {
          const studentGrades = (grades as any[]).filter(
            (g: any) => g.student_id === student.id || g.student_id === student.user_id,
          )

          if (studentGrades.length === 0) continue

          // Compute GWA: weighted average by units
          let totalWeighted = 0
          let totalUnits = 0
          for (const g of studentGrades) {
            const units = g.units ?? 3
            const grade = g.grade ?? g.final_grade ?? 0
            if (typeof grade === 'number' && grade > 0) {
              totalWeighted += grade * units
              totalUnits += units
            }
          }

          if (totalUnits > 0) {
            leaderboard.push({
              student_id: student.user_id ?? student.id,
              student_name: `${student.first_name} ${student.last_name}`,
              program: student.program ?? 'Unknown',
              gwa: totalWeighted / totalUnits,
            })
          }
        }

        // Sort by GWA ascending (lower is better in PH system, 1.0 = highest)
        leaderboard.sort((a, b) => a.gwa - b.gwa)
        setEntries(leaderboard)
      }
    } catch {
      // Tables may not exist yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const filteredEntries = useMemo(() => {
    const filtered =
      programFilter === 'All'
        ? entries
        : entries.filter((e) => e.program === programFilter)
    return filtered.slice(0, 10)
  }, [entries, programFilter])

  const currentUserRank = useMemo(() => {
    if (!user) return null
    const idx = filteredEntries.findIndex((e) => e.student_id === user.id)
    return idx >= 0 ? idx + 1 : null
  }, [filteredEntries, user])

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Academic Leaderboard
        </h1>
        <div className="flex gap-2">
          {PROGRAMS.map((p) => (
            <div
              key={p}
              className="h-9 w-16 animate-pulse rounded-full bg-[var(--color-border)]"
            />
          ))}
        </div>
        <TableSkeleton rows={10} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Academic Leaderboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Top 10 students by General Weighted Average per program
        </p>
      </div>

      {/* Program tabs */}
      <div className="flex flex-wrap gap-2">
        {PROGRAMS.map((prog) => (
          <button
            key={prog}
            type="button"
            onClick={() => setProgramFilter(prog)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              programFilter === prog
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80'
            }`}
          >
            {prog}
          </button>
        ))}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-[var(--color-text-secondary)] italic">
        Names shown only for students who opted in. For MVP, all names are displayed.
      </p>

      {/* Current user rank callout */}
      {currentUserRank && (
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <p className="text-sm text-[var(--color-text-primary)]">
            Your rank:{' '}
            <span className="font-bold">
              #{currentUserRank}
            </span>{' '}
            in {programFilter === 'All' ? 'all programs' : programFilter}
          </p>
        </Card>
      )}

      {/* Leaderboard Table */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={
            <Trophy className="h-7 w-7 text-[var(--color-text-secondary)]" />
          }
          title="No leaderboard data"
          description="Grade data is needed to compute the leaderboard. Check back after grades are submitted."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  <th
                    scope="col"
                    className="w-16 px-4 py-3 text-center font-semibold text-[var(--color-text-primary)]"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] sm:table-cell"
                  >
                    Program
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-[var(--color-text-primary)]"
                  >
                    GWA
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => {
                  const rank = index + 1
                  const isCurrentUser = entry.student_id === user?.id
                  const medalColor = MEDAL_COLORS[rank]

                  return (
                    <tr
                      key={entry.student_id}
                      className={`border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)] ${
                        isCurrentUser
                          ? 'bg-[var(--color-accent)]/10'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        {medalColor ? (
                          <span className="inline-flex items-center justify-center">
                            <Medal
                              className="h-5 w-5"
                              style={{ color: medalColor }}
                              aria-label={`Rank ${rank}`}
                            />
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                            {rank}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isCurrentUser
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-primary)]'
                            }`}
                          >
                            {entry.student_name}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="info" label="You" />
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                          {entry.program}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold ${
                            rank <= 3
                              ? 'text-[var(--color-primary)]'
                              : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {entry.gwa.toFixed(4)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
