/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, BookOpen, GraduationCap, MapIcon, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

// Untyped supabase helper to bypass strict Database generics for admin CRUD
const db = supabase as any

type Tab = 'departments' | 'subjects' | 'programs' | 'curriculum'

export default function AcademicManagementPage() {
  const [tab, setTab] = useState<Tab>('departments')

  return (
    <div className="space-y-6">
      <h1>Academic Management</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Manage departments, subjects, programs, and curriculum mappings.
      </p>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'departments', label: 'Departments', icon: Building2 },
          { key: 'subjects', label: 'Subjects', icon: BookOpen },
          { key: 'programs', label: 'Programs', icon: GraduationCap },
          { key: 'curriculum', label: 'Curriculum Map', icon: MapIcon },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'programs' && <ProgramsTab />}
      {tab === 'curriculum' && <CurriculumTab />}
    </div>
  )
}

// ==========================================
// DEPARTMENTS TAB
// ==========================================
function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', college: '', head_name: '' })

  const fetchDepartments = useCallback(async () => {
    const { data } = await db.from('departments').select('*').order('code')
    if (data) setDepartments(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchDepartments() }, [fetchDepartments])

  const resetForm = () => { setForm({ code: '', name: '', college: '', head_name: '' }); setEditingId(null); setShowForm(false) }

  const handleSave = async () => {
    if (editingId) {
      await db.from('departments').update(form).eq('id', editingId)
    } else {
      await db.from('departments').insert(form)
    }
    resetForm()
    fetchDepartments()
  }

  const handleEdit = (d: any) => {
    setForm({ code: d.code, name: d.name, college: d.college ?? '', head_name: d.head_name ?? '' })
    setEditingId(d.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await db.from('departments').delete().eq('id', id)
    fetchDepartments()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{departments.length} departments</p>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            {editingId ? 'Edit Department' : 'Add Department'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS, MATH, GE" />
            <Input label="Department Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
            <Input label="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="e.g. College of Engineering" />
            <Input label="Department Head" value={form.head_name} onChange={(e) => setForm({ ...form, head_name: e.target.value })} placeholder="e.g. Dr. Juan Dela Cruz" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSave} disabled={!form.code.trim() || !form.name.trim()}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
      ) : departments.length === 0 ? (
        <Card className="text-center py-8">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">No departments yet. Click "Add Department" to create one.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" label={d.code} />
                    <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">{d.name}</p>
                  </div>
                  {d.college && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{d.college}</p>}
                  {d.head_name && <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">Head: {d.head_name}</p>}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => handleEdit(d)} className="rounded p-1.5 hover:bg-[var(--color-border)]" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => handleDelete(d.id)} className="rounded p-1.5 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// SUBJECTS TAB
// ==========================================
function SubjectsTab() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', units: 3, type: 'core' as string, description: '' })

  const fetchSubjects = useCallback(async () => {
    const { data } = await (db.from('subjects').select('*').order('code') as any)
    if (data) setSubjects(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const resetForm = () => {
    setForm({ code: '', name: '', units: 3, type: 'core', description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (editingId) {
      await (db.from('subjects').update({ code: form.code, name: form.name, units: form.units, type: form.type, description: form.description }).eq('id', editingId) as any)
    } else {
      await (db.from('subjects').insert({ code: form.code, name: form.name, units: form.units, type: form.type, description: form.description }) as any)
    }
    resetForm()
    fetchSubjects()
  }

  const handleEdit = (s: any) => {
    setForm({ code: s.code, name: s.name, units: s.units, type: s.type, description: s.description ?? '' })
    setEditingId(s.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await (db.from('subjects').delete().eq('id', id) as any)
    fetchSubjects()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{subjects.length} subjects</p>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            {editingId ? 'Edit Subject' : 'Add Subject'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS 101" />
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Introduction to Computing" />
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Units</label>
              <input type="number" min={1} max={6} value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="ge">General Education</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSave} disabled={!form.code.trim() || !form.name.trim()}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Code</th>
                <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Name</th>
                <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Units</th>
                <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Type</th>
                <th scope="col" className="pb-2 text-right font-semibold text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-2 font-mono text-xs text-[var(--color-text-primary)]">{s.code}</td>
                  <td className="py-2 text-[var(--color-text-primary)]">{s.name}</td>
                  <td className="py-2 text-center">{s.units}</td>
                  <td className="py-2 text-center"><Badge variant={s.type === 'core' ? 'info' : s.type === 'ge' ? 'success' : 'warning'} label={s.type.toUpperCase()} /></td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(s)} className="rounded p-1 hover:bg-[var(--color-border)]" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => handleDelete(s.id)} className="rounded p-1 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ==========================================
// PROGRAMS TAB
// ==========================================
function ProgramsTab() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', total_units: 160, duration_years: 4 })

  const fetchPrograms = useCallback(async () => {
    const { data } = await (db.from('programs').select('*').order('code') as any)
    if (data) setPrograms(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  const resetForm = () => { setForm({ code: '', name: '', total_units: 160, duration_years: 4 }); setEditingId(null); setShowForm(false) }

  const handleSave = async () => {
    if (editingId) {
      await (db.from('programs').update(form).eq('id', editingId) as any)
    } else {
      await (db.from('programs').insert(form) as any)
    }
    resetForm()
    fetchPrograms()
  }

  const handleEdit = (p: any) => {
    setForm({ code: p.code, name: p.name, total_units: p.total_units, duration_years: p.duration_years })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await (db.from('programs').delete().eq('id', id) as any)
    fetchPrograms()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{programs.length} programs</p>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Add Program
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            {editingId ? 'Edit Program' : 'Add Program'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. BSCS" />
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bachelor of Science in Computer Science" />
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Total Units</label>
              <input type="number" min={100} max={300} value={form.total_units} onChange={(e) => setForm({ ...form, total_units: Number(e.target.value) })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Duration (Years)</label>
              <input type="number" min={3} max={6} value={form.duration_years} onChange={(e) => setForm({ ...form, duration_years: Number(e.target.value) })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSave} disabled={!form.code.trim() || !form.name.trim()}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">{p.code}</p>
                  <Badge variant="info" label={`${p.duration_years}yr`} />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">{p.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{p.total_units} total units</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => handleEdit(p)} className="rounded p-1.5 hover:bg-[var(--color-border)]" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleDelete(p.id)} className="rounded p-1.5 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// CURRICULUM MAP TAB
// ==========================================
function CurriculumTab() {
  const [entries, setEntries] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject_id: '', year_level: 1, semester: '1st Sem', subject_type: 'core' })

  const fetchData = useCallback(async () => {
    const [progRes, subRes] = await Promise.all([
      (db.from('programs').select('*').order('code') as any),
      (db.from('subjects').select('*').order('code') as any),
    ])
    if (progRes.data) { setPrograms(progRes.data); if (!selectedProgram && progRes.data[0]) setSelectedProgram(progRes.data[0].id) }
    if (subRes.data) setSubjects(subRes.data)
    setLoading(false)
  }, [selectedProgram])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!selectedProgram) return
    ;(async () => {
      const { data } = await (db.from('curriculum_map').select('*, subjects(code, name, units)').eq('program_id', selectedProgram).order('year_level').order('semester') as any)
      if (data) setEntries(data)
    })()
  }, [selectedProgram])

  const handleAdd = async () => {
    await (db.from('curriculum_map').insert({ program_id: selectedProgram, ...form, prerequisite_subject_ids: [] }) as any)
    setShowForm(false)
    // Refresh
    const { data } = await (db.from('curriculum_map').select('*, subjects(code, name, units)').eq('program_id', selectedProgram).order('year_level').order('semester') as any)
    if (data) setEntries(data)
  }

  const handleDelete = async (id: string) => {
    await (db.from('curriculum_map').delete().eq('id', id) as any)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  // Group by year + semester
  const grouped = new Map<string, any[]>()
  for (const entry of entries) {
    const key = `Year ${entry.year_level} — ${entry.semester}`
    const existing = grouped.get(key) ?? []
    existing.push(entry)
    grouped.set(key, existing)
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
          ))}
        </select>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add Subject to Curriculum
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
            Add Subject to Curriculum
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Subject</label>
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name} ({s.units} units)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Year Level</label>
              <select value={form.year_level} onChange={(e) => setForm({ ...form, year_level: Number(e.target.value) })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="1st Sem">1st Semester</option>
                <option value="2nd Sem">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Type</label>
              <select value={form.subject_type} onChange={(e) => setForm({ ...form, subject_type: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="ge">General Education</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleAdd} disabled={!form.subject_id}>Add</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-[var(--color-text-secondary)]">No subjects mapped to this program yet. Click "Add Subject to Curriculum" to start.</p>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([label, items]) => (
          <div key={label}>
            <h3 className="mb-2 font-display text-sm font-semibold text-[var(--color-text-primary)]">{label}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Code</th>
                    <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Subject</th>
                    <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Units</th>
                    <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Type</th>
                    <th scope="col" className="pb-2 text-right font-semibold text-[var(--color-text-secondary)]">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="py-2 font-mono text-xs">{entry.subjects?.code ?? '?'}</td>
                      <td className="py-2">{entry.subjects?.name ?? '?'}</td>
                      <td className="py-2 text-center">{entry.subjects?.units ?? '?'}</td>
                      <td className="py-2 text-center"><Badge variant={entry.subject_type === 'core' ? 'info' : entry.subject_type === 'ge' ? 'success' : 'warning'} label={entry.subject_type.toUpperCase()} /></td>
                      <td className="py-2 text-right">
                        <button type="button" onClick={() => handleDelete(entry.id)} className="rounded p-1 hover:bg-[var(--color-error)]/10 text-[var(--color-error)]" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
