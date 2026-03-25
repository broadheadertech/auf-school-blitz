import { useState, useEffect, useCallback } from 'react'
import { FileText, ChevronDown, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Navigate } from 'react-router-dom'

const db = supabase as any

interface AuditEntry {
  id: string
  user_id: string
  user_email?: string
  action: string
  table_name: string
  details: string | null
  created_at: string
}

const ACTION_TYPES = ['all', 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] as const
type ActionFilter = (typeof ACTION_TYPES)[number]

const ACTION_BADGE: Record<string, BadgeVariant> = {
  INSERT: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'warning',
  LOGOUT: 'neutral',
}

const PAGE_SIZE = 20

export default function AuditLogPage() {
  const { role } = useAuthStore()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const fetchEntries = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)

      try {
        let query = db
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

        if (actionFilter !== 'all') {
          query = query.eq('action', actionFilter)
        }
        if (dateFrom) {
          query = query.gte('created_at', `${dateFrom}T00:00:00Z`)
        }
        if (dateTo) {
          query = query.lte('created_at', `${dateTo}T23:59:59Z`)
        }

        const { data } = await query
        const rows: AuditEntry[] = data ?? []

        if (append) {
          setEntries((prev) => [...prev, ...rows])
        } else {
          setEntries(rows)
        }
        setHasMore(rows.length === PAGE_SIZE)
      } catch {
        // Table may not exist yet
        if (!append) setEntries([])
        setHasMore(false)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [actionFilter, dateFrom, dateTo],
  )

  useEffect(() => {
    if (role !== 'admin') return
    setPage(0)
    fetchEntries(0)
  }, [fetchEntries, role])

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchEntries(nextPage, true)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Audit Log
        </h1>
        <Card>
          <div className="flex gap-3">
            <div className="h-10 w-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
            <div className="h-10 w-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
            <div className="h-10 w-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
          </div>
        </Card>
        <TableSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
        Audit Log
      </h1>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Action filter */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">
              Action
            </label>
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                className="h-10 appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-3 pr-8 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              >
                {ACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Actions' : type}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">
              From
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
                aria-hidden="true"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">
              To
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
                aria-hidden="true"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>

          {(dateFrom || dateTo || actionFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setActionFilter('all')
                setDateFrom('')
                setDateTo('')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-secondary)]">
        {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} shown
      </p>

      {/* Entries Table */}
      {entries.length === 0 ? (
        <EmptyState
          icon={
            <FileText className="h-7 w-7 text-[var(--color-text-secondary)]" />
          }
          title="No audit log entries"
          description="System activity will be recorded here as users interact with the platform."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] sm:table-cell"
                  >
                    Table
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] md:table-cell"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                      {new Date(entry.created_at).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {entry.user_email || entry.user_id?.slice(0, 8) || '---'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={ACTION_BADGE[entry.action] ?? 'neutral'}
                        label={entry.action}
                      />
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-text-secondary)] sm:table-cell">
                      {entry.table_name || '---'}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-xs text-[var(--color-text-secondary)] md:table-cell">
                      {entry.details || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={handleLoadMore} loading={loadingMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
