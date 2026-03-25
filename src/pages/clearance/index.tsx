import { useState, useEffect, useMemo } from 'react'
import { ShieldCheck, Search, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

const DEPARTMENTS = [
  'Library',
  'Finance',
  'Registrar',
  'Department',
  'Student Affairs',
  'IT',
] as const

type ClearanceStatus = 'pending' | 'cleared' | 'hold'

interface ClearanceItem {
  id: string
  student_id: string
  department: string
  status: ClearanceStatus
  remarks: string | null
  semester: string
  academic_year: string
  updated_at: string
  student_name?: string
}

const STATUS_MAP: Record<ClearanceStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  cleared: { variant: 'success', label: 'Cleared' },
  hold: { variant: 'error', label: 'Hold' },
}

export default function ClearancePage() {
  const { role } = useAuthStore()

  if (role === 'admin') {
    return <AdminClearanceView />
  }

  return <StudentClearanceView />
}

function StudentClearanceView() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<ClearanceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      try {
        const { data: student } = await db
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!student) { setLoading(false); return }

        const { data } = await db
          .from('clearance_items')
          .select('*')
          .eq('student_id', student.id)
          .order('department', { ascending: true })

        setItems(data ?? [])
      } catch {
        // Silently handle
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  // Group by department
  const grouped = useMemo(() => {
    const map: Record<string, ClearanceItem[]> = {}
    for (const item of items) {
      if (!map[item.department]) map[item.department] = []
      map[item.department]!.push(item)
    }
    return map
  }, [items])

  const allCleared = items.length > 0 && items.every((i) => i.status === 'cleared')
  const hasHold = items.some((i) => i.status === 'hold')

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Student Clearance</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Your digital clearance checklist
          </p>
        </div>
        {items.length > 0 && (
          <div>
            {allCleared ? (
              <Badge variant="success" label="Fully Cleared" />
            ) : hasHold ? (
              <Badge variant="error" label="Has Hold(s)" />
            ) : (
              <Badge variant="warning" label="In Progress" />
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No clearance requirements found for this semester"
          description="Clearance items will appear here once they are created by the administration."
        />
      ) : (
        <>
          {/* Summary bar */}
          <Card className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Cleared: {items.filter((i) => i.status === 'cleared').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Pending: {items.filter((i) => i.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Hold: {items.filter((i) => i.status === 'hold').length}
              </span>
            </div>
            <div className="ml-auto text-xs text-[var(--color-text-secondary)]">
              {items.filter((i) => i.status === 'cleared').length}/{items.length} departments cleared
            </div>
          </Card>

          {/* Department cards */}
          <div className="space-y-3">
            {Object.entries(grouped).map(([dept, deptItems]) => (
              <Card key={dept}>
                {deptItems.map((item) => {
                  const statusInfo = STATUS_MAP[item.status]
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            item.status === 'cleared'
                              ? 'bg-green-50'
                              : item.status === 'hold'
                                ? 'bg-red-50'
                                : 'bg-amber-50'
                          }`}
                        >
                          <ShieldCheck
                            className={`h-4 w-4 ${
                              item.status === 'cleared'
                                ? 'text-green-600'
                                : item.status === 'hold'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {item.department}
                          </p>
                          {item.remarks && (
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {item.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={statusInfo.variant} label={statusInfo.label} />
                    </div>
                  )
                })}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AdminClearanceView() {
  const [items, setItems] = useState<ClearanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchAll = async () => {
    setLoading(true)
    try {
      let query = db
        .from('clearance_items')
        .select('*, students(first_name, last_name)')
        .order('department', { ascending: true })

      if (filterDept !== 'all') {
        query = query.eq('department', filterDept)
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data } = await query
      const mapped = (data ?? []).map((r: any) => ({
        ...r,
        student_name: r.students
          ? `${r.students.first_name ?? ''} ${r.students.last_name ?? ''}`.trim()
          : 'Unknown',
      }))
      setItems(mapped)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [filterDept, filterStatus])

  const handleStatusChange = async (itemId: string, newStatus: ClearanceStatus) => {
    await db
      .from('clearance_items')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', itemId)

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)),
    )
  }

  const handleRemarksChange = async (itemId: string, remarks: string) => {
    await db
      .from('clearance_items')
      .update({ remarks, updated_at: new Date().toISOString() })
      .eq('id', itemId)

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, remarks } : i)),
    )
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (i) =>
        (i.student_name ?? '').toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q),
    )
  }, [items, searchQuery])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Clearance Management</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage student clearance items across departments
          </p>
        </div>
        <Button variant="ghost" onClick={fetchAll}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Search by student name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
          <option value="hold">Hold</option>
        </select>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {items.filter((i) => i.status === 'pending').length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {items.filter((i) => i.status === 'cleared').length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Cleared</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {items.filter((i) => i.status === 'hold').length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">On Hold</p>
        </Card>
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No clearance items found"
          description="No items match the current filters."
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const statusInfo = STATUS_MAP[item.status]
            return (
              <Card key={item.id} className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {item.student_name}
                      </p>
                      <Badge variant={statusInfo.variant} label={statusInfo.label} />
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {item.department} | {item.semester} {item.academic_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as ClearanceStatus)
                      }
                      className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="cleared">Cleared</option>
                      <option value="hold">Hold</option>
                    </select>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Add remarks..."
                    defaultValue={item.remarks ?? ''}
                    onBlur={(e) => {
                      if (e.target.value !== (item.remarks ?? '')) {
                        handleRemarksChange(item.id, e.target.value)
                      }
                    }}
                    className="h-8 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
