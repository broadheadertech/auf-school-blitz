import { useState, useEffect } from 'react'
import { FileText, Plus, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

const DOCUMENT_TYPES = [
  'Transcript of Records',
  'Good Moral Certificate',
  'Certification',
  'Enrollment Certificate',
  'Grades Certificate',
] as const

type DocumentType = (typeof DOCUMENT_TYPES)[number]

interface DocumentRequest {
  id: string
  student_id: string
  document_type: DocumentType
  purpose: string
  status: 'pending' | 'processing' | 'ready' | 'claimed'
  created_at: string
  updated_at: string
  student_name?: string
}

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  processing: { variant: 'info', label: 'Processing' },
  ready: { variant: 'success', label: 'Ready for Pickup' },
  claimed: { variant: 'neutral', label: 'Claimed' },
}

export default function DocumentsPage() {
  const { role } = useAuthStore()

  if (role === 'admin') {
    return <AdminDocumentView />
  }

  return <StudentDocumentView />
}

function StudentDocumentView() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [docType, setDocType] = useState<DocumentType>(DOCUMENT_TYPES[0])
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: student } = await db
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!student) { setLoading(false); return }

      const { data } = await db
        .from('document_requests')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })

      setRequests(data ?? [])
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  const handleSubmit = async () => {
    if (!user || !purpose.trim()) return
    setSubmitting(true)
    try {
      const { data: student } = await db
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!student) { setSubmitting(false); return }

      await db.from('document_requests').insert({
        student_id: student.id,
        document_type: docType,
        purpose: purpose.trim(),
        status: 'pending',
      })

      setPurpose('')
      setShowForm(false)
      await fetchRequests()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Document Requests</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Request official school documents
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Request
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <Card>
          <h3 className="mb-4 font-display text-sm font-bold text-[var(--color-text-primary)]">
            Request a Document
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Document Type <span className="text-[var(--color-error)] ml-0.5">*</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Purpose <span className="text-[var(--color-error)] ml-0.5">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. For employment application, for scholarship, etc."
                rows={3}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={submitting}
                disabled={!purpose.trim()}
                onClick={handleSubmit}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Request List */}
      {requests.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No document requests"
          description="You haven't requested any documents yet. Click 'New Request' to get started."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusInfo = STATUS_MAP[req.status] ?? { variant: 'neutral' as const, label: req.status }
            return (
              <Card key={req.id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {req.document_type}
                    </p>
                    <Badge variant={statusInfo.variant} label={statusInfo.label} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {req.purpose}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
                    Requested: {new Date(req.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AdminDocumentView() {
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchAllRequests = async () => {
    setLoading(true)
    try {
      let query = db
        .from('document_requests')
        .select('*, students(first_name, last_name)')
        .order('created_at', { ascending: false })

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
      setRequests(mapped)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRequests()
  }, [filterStatus])

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    await db
      .from('document_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus as any } : r)),
    )
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Document Requests</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage student document requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="claimed">Claimed</option>
          </select>
          <Button variant="ghost" onClick={fetchAllRequests}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No requests found"
          description="No document requests match the current filter."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusInfo = STATUS_MAP[req.status] ?? { variant: 'neutral' as const, label: req.status }
            return (
              <Card key={req.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {req.document_type}
                    </p>
                    <Badge variant={statusInfo.variant} label={statusInfo.label} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Student: {req.student_name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Purpose: {req.purpose}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">
                    {new Date(req.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
