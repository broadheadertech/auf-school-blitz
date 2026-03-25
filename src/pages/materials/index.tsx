/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Plus, FileText, Link as LinkIcon, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { useFacultySections } from '@/hooks/use-supabase-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export default function MaterialsPage() {
  const { role } = useAuthStore()

  if (role === 'student') return <StudentMaterialsView />
  if (role === 'faculty') return <FacultyMaterialsView />

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Class materials are available for faculty and students.
      </p>
    </div>
  )
}

/* ─────────────── Faculty View ─────────────── */

function FacultyMaterialsView() {
  const { profile } = useAuthStore()
  const { sections, loading: sectionsLoading } = useFacultySections()

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', file_url: '', file_type: 'pdf' })

  const selectedSection = sections.find((s: any) => s.id === selectedSectionId)

  const fetchMaterials = useCallback(async (sectionId: string) => {
    setLoadingMaterials(true)
    const { data } = await db
      .from('class_materials')
      .select('*')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false })
    if (data) setMaterials(data)
    setLoadingMaterials(false)
  }, [])

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setShowForm(false)
    fetchMaterials(sectionId)
  }

  const resetForm = () => {
    setForm({ title: '', description: '', file_url: '', file_type: 'pdf' })
    setShowForm(false)
  }

  const handleAddMaterial = async () => {
    if (!selectedSectionId || !form.title.trim() || !form.file_url.trim()) return
    setSaving(true)

    try {
      await db.from('class_materials').insert({
        section_id: selectedSectionId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        file_url: form.file_url.trim(),
        file_type: form.file_type,
        uploaded_by: (profile as any)?.id ?? null,
      })
      resetForm()
      fetchMaterials(selectedSectionId)
    } catch (err) {
      console.error('Error adding material:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (materialId: string) => {
    if (!selectedSectionId) return
    await db.from('class_materials').delete().eq('id', materialId)
    fetchMaterials(selectedSectionId)
  }

  const FILE_TYPES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'video', 'link', 'other']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          Class Materials
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Upload and manage course materials for your sections
        </p>
      </div>

      {/* Section selector */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Section</label>
        {sectionsLoading ? (
          <div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
        ) : (
          <select
            value={selectedSectionId ?? ''}
            onChange={(e) => handleSelectSection(e.target.value)}
            className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          >
            <option value="">Select section...</option>
            {sections.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.subjects?.code ?? '?'} — {s.section_code} ({s.subjects?.name})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedSectionId && (
        <>
          {/* Add button */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              Materials for {selectedSection?.subjects?.code} — {selectedSection?.section_code}
            </h2>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add Material
            </Button>
          </div>

          {/* Add material form */}
          {showForm && (
            <Card>
              <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
                New Material
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chapter 1 Lecture Slides"
                />
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">File Type</label>
                  <select
                    value={form.file_type}
                    onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  >
                    {FILE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="File URL"
                    required
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleAddMaterial}
                  disabled={saving || !form.title.trim() || !form.file_url.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Add Material'
                  )}
                </Button>
                <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </Card>
          )}

          {/* Materials list */}
          {loadingMaterials ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : materials.length === 0 ? (
            <Card className="py-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                No materials uploaded yet. Add your first material above.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {materials.map((m: any) => (
                <Card key={m.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {m.title}
                      </p>
                      <Badge variant="info" label={m.file_type?.toUpperCase() ?? 'FILE'} />
                    </div>
                    {m.description && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {m.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      Uploaded {new Date(m.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)] transition-colors"
                    >
                      <LinkIcon className="h-3 w-3" /> Open
                    </a>
                    <Button variant="destructive" onClick={() => handleDelete(m.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ─────────────── Student View ─────────────── */

function StudentMaterialsView() {
  const { user } = useAuthStore()
  const [sectionMaterials, setSectionMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ;(async () => {
      // Get student id
      const { data: student } = await db.from('students').select('id').eq('user_id', user.id).maybeSingle()
      if (!student) { setLoading(false); return }

      // Get enrolled sections
      const { data: enrollments } = await db
        .from('enrollments')
        .select('section_id, sections(id, section_code, subjects(code, name))')
        .eq('student_id', student.id)
        .eq('status', 'confirmed')

      const enrolledSections = (enrollments ?? [])
        .filter((e: any) => e.sections)
        .map((e: any) => e.sections)

      if (enrolledSections.length === 0) { setLoading(false); return }

      // Fetch materials for all enrolled sections
      const sectionIds = enrolledSections.map((s: any) => s.id)
      const { data: allMaterials } = await db
        .from('class_materials')
        .select('*')
        .in('section_id', sectionIds)
        .order('created_at', { ascending: false })

      // Group by section
      const grouped = enrolledSections.map((section: any) => ({
        ...section,
        materials: (allMaterials ?? []).filter((m: any) => m.section_id === section.id),
      }))

      setSectionMaterials(grouped)
      // Expand all by default
      setExpandedSections(new Set(enrolledSections.map((s: any) => s.id)))
      setLoading(false)
    })()
  }, [user])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          Class Materials
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Browse materials for your enrolled sections
        </p>
      </div>

      {sectionMaterials.length === 0 ? (
        <Card className="py-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            No class materials available yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sectionMaterials.map((section: any) => {
            const isExpanded = expandedSections.has(section.id)
            return (
              <Card key={section.id}>
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    )}
                    <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                      {section.subjects?.code ?? '?'} — {section.section_code}
                    </p>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {section.subjects?.name}
                    </span>
                  </div>
                  <Badge
                    variant={section.materials.length > 0 ? 'info' : 'neutral'}
                    label={`${section.materials.length} material${section.materials.length !== 1 ? 's' : ''}`}
                  />
                </button>

                {/* Accordion content */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3">
                    {section.materials.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-secondary)]">No materials uploaded yet.</p>
                    ) : (
                      section.materials.map((m: any) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-secondary)]" />
                              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{m.title}</p>
                              <Badge variant="info" label={m.file_type?.toUpperCase() ?? 'FILE'} />
                            </div>
                            {m.description && (
                              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-1">{m.description}</p>
                            )}
                            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                              {new Date(m.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)] transition-colors"
                          >
                            <LinkIcon className="h-3 w-3" /> Open
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
