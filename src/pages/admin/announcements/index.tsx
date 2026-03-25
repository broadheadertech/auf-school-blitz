/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Megaphone, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import type { BadgeVariant } from '@/components/ui/badge'

const db = supabase as any

type Priority = 'low' | 'normal' | 'high' | 'urgent'

const PROGRAMS = ['BSCS', 'BSIT', 'BSN', 'BSBA'] as const
const YEAR_LEVELS = [1, 2, 3, 4] as const

const PRIORITY_BADGE: Record<Priority, { variant: BadgeVariant; label: string }> = {
  low: { variant: 'neutral', label: 'Low' },
  normal: { variant: 'info', label: 'Normal' },
  high: { variant: 'warning', label: 'High' },
  urgent: { variant: 'error', label: 'Urgent' },
}

export default function AnnouncementsManagementPage() {
  const { role, profile } = useAuthStore()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as Priority,
    target_programs: [] as string[],
    target_year_levels: [] as number[],
    all_programs: true,
    all_years: true,
  })

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await db
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      priority: 'normal',
      target_programs: [],
      target_year_levels: [],
      all_programs: true,
      all_years: true,
    })
    setShowForm(false)
  }

  const toggleProgram = (program: string) => {
    setForm((prev) => {
      const programs = prev.target_programs.includes(program)
        ? prev.target_programs.filter((p) => p !== program)
        : [...prev.target_programs, program]
      return { ...prev, target_programs: programs, all_programs: false }
    })
  }

  const toggleYearLevel = (year: number) => {
    setForm((prev) => {
      const years = prev.target_year_levels.includes(year)
        ? prev.target_year_levels.filter((y) => y !== year)
        : [...prev.target_year_levels, year]
      return { ...prev, target_year_levels: years, all_years: false }
    })
  }

  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)

    try {
      const targetPrograms = form.all_programs ? PROGRAMS.slice() : form.target_programs
      const targetYears = form.all_years ? YEAR_LEVELS.slice() : form.target_year_levels

      await db.from('announcements').insert({
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        target_programs: targetPrograms,
        target_year_levels: targetYears,
        published_at: new Date().toISOString(),
        published_by: (profile as any)?.id ?? null,
      })

      resetForm()
      fetchAnnouncements()
    } catch (err) {
      console.error('Error publishing announcement:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await db.from('announcements').delete().eq('id', id)
    fetchAnnouncements()
  }

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-[var(--color-text-secondary)]">
          This page is only accessible to administrators.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
            Announcements
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Create and manage targeted announcements
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            New Announcement
          </h3>
          <div className="space-y-3">
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title..."
            />

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">
                Content <span className="text-[var(--color-error)] ml-0.5">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Announcement content..."
                rows={4}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Target Programs */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                Target Programs
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    checked={form.all_programs}
                    onChange={() => setForm({ ...form, all_programs: !form.all_programs, target_programs: [] })}
                    className="rounded"
                  />
                  All Programs
                </label>
                {PROGRAMS.map((program) => (
                  <label key={program} className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={form.all_programs || form.target_programs.includes(program)}
                      disabled={form.all_programs}
                      onChange={() => toggleProgram(program)}
                      className="rounded"
                    />
                    {program}
                  </label>
                ))}
              </div>
            </div>

            {/* Target Year Levels */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                Target Year Levels
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    checked={form.all_years}
                    onChange={() => setForm({ ...form, all_years: !form.all_years, target_year_levels: [] })}
                    className="rounded"
                  />
                  All Years
                </label>
                {YEAR_LEVELS.map((year) => (
                  <label key={year} className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={form.all_years || form.target_year_levels.includes(year)}
                      disabled={form.all_years}
                      onChange={() => toggleYearLevel(year)}
                      className="rounded"
                    />
                    Year {year}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={saving || !form.title.trim() || !form.content.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  'Publish Announcement'
                )}
              </Button>
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Existing announcements */}
      {announcements.length === 0 ? (
        <Card className="py-8 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            No announcements yet. Create your first one above.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a: any) => {
            const priorityBadge = PRIORITY_BADGE[a.priority as Priority] ?? PRIORITY_BADGE.normal
            const programs: string[] = Array.isArray(a.target_programs) ? a.target_programs : []
            const years: number[] = Array.isArray(a.target_year_levels) ? a.target_year_levels : []
            const isAllPrograms = programs.length === PROGRAMS.length || programs.length === 0
            const isAllYears = years.length === YEAR_LEVELS.length || years.length === 0

            return (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                        {a.title}
                      </h3>
                      <Badge variant={priorityBadge.variant} label={priorityBadge.label} />
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                      {a.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span>
                        {a.published_at
                          ? new Date(a.published_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Draft'}
                      </span>
                      <span className="text-[var(--color-border)]">|</span>
                      <span>
                        Programs: {isAllPrograms ? 'All' : programs.join(', ')}
                      </span>
                      <span className="text-[var(--color-border)]">|</span>
                      <span>
                        Years: {isAllYears ? 'All' : years.map((y: number) => `Year ${y}`).join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="shrink-0 rounded p-1.5 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]"
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
