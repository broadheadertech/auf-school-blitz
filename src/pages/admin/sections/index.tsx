/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export default function SectionsManagementPage() {
  const [sections, setSections] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    subject_id: '',
    section_code: '',
    faculty_id: '',
    capacity: 40,
    schedule_day: 'Mon',
    schedule_start: '08:00',
    schedule_end: '09:30',
    schedule_room: '',
  })

  const fetchData = useCallback(async () => {
    const [secRes, subRes, facRes, setRes] = await Promise.all([
      db.from('sections').select('*, subjects(code, name, units), faculty(first_name, last_name)').order('section_code'),
      db.from('subjects').select('id, code, name').order('code'),
      db.from('faculty').select('id, first_name, last_name, department').order('last_name'),
      db.from('academic_settings').select('key, value'),
    ])
    if (secRes.data) setSections(secRes.data)
    if (subRes.data) setSubjects(subRes.data)
    if (facRes.data) setFaculty(facRes.data)
    if (setRes.data) {
      const map: Record<string, string> = {}
      for (const s of setRes.data) map[s.key] = s.value
      setSettings(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setForm({ subject_id: '', section_code: '', faculty_id: '', capacity: 40, schedule_day: 'Mon', schedule_start: '08:00', schedule_end: '09:30', schedule_room: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    const schedule = [{ day: form.schedule_day, start: form.schedule_start, end: form.schedule_end, room: form.schedule_room }]
    const payload = {
      subject_id: form.subject_id,
      section_code: form.section_code,
      faculty_id: form.faculty_id,
      capacity: form.capacity,
      enrolled_count: 0,
      schedule_json: schedule,
      semester: settings.current_semester || '2nd Sem',
      academic_year: settings.current_academic_year || '2025-2026',
      status: 'open',
    }

    if (editingId) {
      await db.from('sections').update({ ...payload, enrolled_count: undefined }).eq('id', editingId)
    } else {
      await db.from('sections').insert(payload)
    }
    resetForm()
    fetchData()
  }

  const handleDelete = async (id: string) => {
    await db.from('sections').delete().eq('id', id)
    fetchData()
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open'
    await db.from('sections').update({ status: newStatus }).eq('id', id)
    fetchData()
  }

  const currentSem = settings.current_semester || '2nd Sem'
  const currentAY = settings.current_academic_year || '2025-2026'
  const currentSections = sections.filter((s: any) => s.semester === currentSem && s.academic_year === currentAY)

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Sections Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{currentSem} AY {currentAY} — {currentSections.length} sections</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> New Section
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            {editingId ? 'Edit Section' : 'Create Section'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Subject</label>
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="">Select subject...</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>
            <Input label="Section Code" value={form.section_code} onChange={(e) => setForm({ ...form, section_code: e.target.value })} placeholder="e.g. CS101-A" />
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Faculty</label>
              <select value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="">Select faculty...</option>
                {faculty.map((f: any) => <option key={f.id} value={f.id}>{f.last_name}, {f.first_name} — {f.department}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Capacity</label>
              <input type="number" min={1} max={500} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Day</label>
              <select value={form.schedule_day} onChange={(e) => setForm({ ...form, schedule_day: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Start" type="time" value={form.schedule_start} onChange={(e) => setForm({ ...form, schedule_start: e.target.value })} />
              <Input label="End" type="time" value={form.schedule_end} onChange={(e) => setForm({ ...form, schedule_end: e.target.value })} />
            </div>
            <Input label="Room" value={form.schedule_room} onChange={(e) => setForm({ ...form, schedule_room: e.target.value })} placeholder="e.g. CL-301" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSave} disabled={!form.subject_id || !form.section_code || !form.faculty_id}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {currentSections.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-[var(--color-text-secondary)]">No sections for {currentSem} AY {currentAY}. Create one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentSections.map((s: any) => {
            const fillPercent = s.capacity > 0 ? Math.round((s.enrolled_count / s.capacity) * 100) : 0
            const schedule = Array.isArray(s.schedule_json) ? s.schedule_json : []

            return (
              <Card key={s.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                      {s.subjects?.code ?? '?'} — {s.section_code}
                    </p>
                    <Badge variant={s.status === 'open' ? 'success' : 'error'} label={s.status} />
                    <Badge variant={fillPercent > 90 ? 'error' : fillPercent > 70 ? 'warning' : 'success'} label={`${fillPercent}%`} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {s.subjects?.name} ({s.subjects?.units} units)
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.enrolled_count}/{s.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {schedule.map((sc: any) => `${sc.day} ${sc.start}-${sc.end} (${sc.room})`).join(', ')}
                    </span>
                    <span>Faculty: {s.faculty?.last_name ?? '?'}, {s.faculty?.first_name ?? '?'}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="secondary" onClick={() => handleToggleStatus(s.id, s.status)}>
                    {s.status === 'open' ? 'Close' : 'Open'}
                  </Button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="rounded p-1.5 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]" aria-label="Delete">
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
