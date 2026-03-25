import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Navigate } from 'react-router-dom'

const db = supabase as any

interface Scholarship {
  id: string
  name: string
  description: string
  max_gwa: number
  min_year_level: number
  programs: string[]
  slots: number
  deadline: string
  is_active: boolean
  created_at: string
}

interface ScholarshipApplication {
  id: string
  scholarship_id: string
  student_id: string
  student_name: string
  gwa: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const PROGRAMS = ['BSCS', 'BSIT', 'BSN', 'BSBA']

const STATUS_BADGE: Record<string, BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

export default function ScholarshipManagementPage() {
  const { role, user, profile } = useAuthStore()
  const isAdmin = role === 'admin'

  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formMaxGwa, setFormMaxGwa] = useState('')
  const [formMinYear, setFormMinYear] = useState('1')
  const [formPrograms, setFormPrograms] = useState<string[]>([])
  const [formSlots, setFormSlots] = useState('')
  const [formDeadline, setFormDeadline] = useState('')

  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false })
      setScholarships(data ?? [])
    } catch {
      // Table may not exist yet
    }
    try {
      const { data } = await db
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false })
      setApplications(data ?? [])
    } catch {
      // Table may not exist yet
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  if (!isAdmin && role !== 'student') {
    return <Navigate to="/dashboard" replace />
  }

  function resetForm() {
    setFormName('')
    setFormDescription('')
    setFormMaxGwa('')
    setFormMinYear('1')
    setFormPrograms([])
    setFormSlots('')
    setFormDeadline('')
    setShowForm(false)
  }

  async function handleAddScholarship(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await db.from('scholarships').insert({
        name: formName,
        description: formDescription,
        max_gwa: parseFloat(formMaxGwa),
        min_year_level: parseInt(formMinYear),
        programs: formPrograms,
        slots: parseInt(formSlots),
        deadline: formDeadline,
        is_active: true,
      })
      resetForm()
      await fetchScholarships()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateApplicationStatus(
    applicationId: string,
    status: 'approved' | 'rejected',
  ) {
    try {
      await db
        .from('scholarship_applications')
        .update({ status })
        .eq('id', applicationId)
      await fetchScholarships()
    } catch {
      // Silently handle
    }
  }

  async function handleApply(scholarshipId: string) {
    if (!user) return
    setSubmitting(true)
    try {
      await db.from('scholarship_applications').insert({
        scholarship_id: scholarshipId,
        student_id: user.id,
        student_name: profile
          ? `${(profile as any).first_name} ${(profile as any).last_name}`
          : 'Unknown',
        gwa: 0,
        status: 'pending',
      })
      await fetchScholarships()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  function toggleProgram(prog: string) {
    setFormPrograms((prev) =>
      prev.includes(prog) ? prev.filter((p) => p !== prog) : [...prev, prog],
    )
  }

  const filteredScholarships = scholarships.filter(
    (s) =>
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          {isAdmin ? 'Scholarship Management' : 'Scholarships'}
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        {isAdmin && <TableSkeleton rows={4} />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          {isAdmin ? 'Scholarship Management' : 'Scholarships'}
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none sm:w-56"
              aria-label="Search scholarships"
            />
          </div>
          {isAdmin && (
            <Button variant="accent" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Scholarship
            </Button>
          )}
        </div>
      </div>

      {/* Add Scholarship Form (Admin) */}
      {isAdmin && showForm && (
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            New Scholarship
          </h2>
          <form onSubmit={handleAddScholarship} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Scholarship Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="e.g. Academic Excellence Award"
              />
              <Input
                label="Max GWA Requirement"
                type="number"
                step="0.01"
                min="1"
                max="5"
                value={formMaxGwa}
                onChange={(e) => setFormMaxGwa(e.target.value)}
                required
                placeholder="e.g. 1.75"
                helperText="Students must have GWA at or below this value"
              />
              <Input
                label="Minimum Year Level"
                type="number"
                min="1"
                max="5"
                value={formMinYear}
                onChange={(e) => setFormMinYear(e.target.value)}
                required
              />
              <Input
                label="Available Slots"
                type="number"
                min="1"
                value={formSlots}
                onChange={(e) => setFormSlots(e.target.value)}
                required
                placeholder="e.g. 10"
              />
              <Input
                label="Deadline"
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                placeholder="Describe the scholarship..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Eligible Programs
              </label>
              <div className="flex flex-wrap gap-2">
                {PROGRAMS.map((prog) => (
                  <button
                    key={prog}
                    type="button"
                    onClick={() => toggleProgram(prog)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      formPrograms.includes(prog)
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={submitting}>
                Create Scholarship
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Scholarships List */}
      {filteredScholarships.length === 0 ? (
        <EmptyState
          icon={
            <GraduationCap className="h-7 w-7 text-[var(--color-text-secondary)]" />
          }
          title="No scholarships yet"
          description={
            isAdmin
              ? 'Create the first scholarship using the form above.'
              : 'No scholarships are currently available. Check back later.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScholarships.map((scholarship) => {
            const isExpired =
              new Date(scholarship.deadline) < new Date()
            const hasApplied = applications.some(
              (a) =>
                a.scholarship_id === scholarship.id &&
                a.student_id === user?.id,
            )

            return (
              <Card key={scholarship.id}>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                    {scholarship.name}
                  </h3>
                  <Badge
                    variant={
                      scholarship.is_active && !isExpired ? 'success' : 'neutral'
                    }
                    label={
                      scholarship.is_active && !isExpired ? 'Active' : 'Closed'
                    }
                  />
                </div>
                {scholarship.description && (
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                    {scholarship.description}
                  </p>
                )}
                <div className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p>
                    Max GWA:{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {scholarship.max_gwa}
                    </span>
                  </p>
                  <p>
                    Slots:{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {scholarship.slots}
                    </span>
                  </p>
                  <p>
                    Deadline:{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {new Date(scholarship.deadline).toLocaleDateString(
                        'en-PH',
                        { month: 'short', day: 'numeric', year: 'numeric' },
                      )}
                    </span>
                  </p>
                  {scholarship.programs?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {scholarship.programs.map((p: string) => (
                        <span
                          key={p}
                          className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student: Apply button */}
                {role === 'student' &&
                  scholarship.is_active &&
                  !isExpired && (
                    <div className="mt-3">
                      {hasApplied ? (
                        <Badge variant="info" label="Applied" />
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => handleApply(scholarship.id)}
                          loading={submitting}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Applications Table (Admin) */}
      {isAdmin && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Applications
          </h2>
          {applications.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-7 w-7 text-[var(--color-text-secondary)]" />}
              title="No applications yet"
              description="Student applications will appear here once submitted."
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
                        Student
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                      >
                        GWA
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] sm:table-cell"
                      >
                        Applied
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 font-semibold text-[var(--color-text-primary)]"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)]"
                      >
                        <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                          {app.student_name}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                          {app.gwa.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={STATUS_BADGE[app.status] ?? 'neutral'}
                            label={
                              app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)
                            }
                          />
                        </td>
                        <td className="hidden px-4 py-3 text-[var(--color-text-secondary)] sm:table-cell">
                          {new Date(app.created_at).toLocaleDateString(
                            'en-PH',
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateApplicationStatus(
                                    app.id,
                                    'approved',
                                  )
                                }
                                className="rounded-[var(--radius-md)] p-2 text-green-600 transition-colors hover:bg-green-50"
                                aria-label={`Approve ${app.student_name}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateApplicationStatus(
                                    app.id,
                                    'rejected',
                                  )
                                }
                                className="rounded-[var(--radius-md)] p-2 text-red-600 transition-colors hover:bg-red-50"
                                aria-label={`Reject ${app.student_name}`}
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
