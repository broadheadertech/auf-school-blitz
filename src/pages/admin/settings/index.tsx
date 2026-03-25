/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

const db = supabase as any

const SETTING_LABELS: Record<string, { label: string; type: 'text' | 'date' | 'boolean' | 'number'; group: string }> = {
  current_semester: { label: 'Current Semester', type: 'text', group: 'Academic' },
  current_academic_year: { label: 'Academic Year', type: 'text', group: 'Academic' },
  enrollment_open: { label: 'Enrollment Open', type: 'boolean', group: 'Enrollment' },
  enrollment_start: { label: 'Enrollment Start Date', type: 'date', group: 'Enrollment' },
  enrollment_end: { label: 'Enrollment End Date', type: 'date', group: 'Enrollment' },
  grading_open: { label: 'Grading Open', type: 'boolean', group: 'Grading' },
  grading_deadline: { label: 'Grading Deadline', type: 'date', group: 'Grading' },
  payment_deadline: { label: 'Payment Deadline', type: 'date', group: 'Payments' },
  tuition_per_unit: { label: 'Tuition per Unit (₱)', type: 'number', group: 'Payments' },
  misc_fee: { label: 'Miscellaneous Fee (₱)', type: 'number', group: 'Payments' },
  lab_fee: { label: 'Laboratory Fee (₱)', type: 'number', group: 'Payments' },
}

export default function AcademicSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    const { data } = await db.from('academic_settings').select('key, value')
    if (data) {
      const map: Record<string, string> = {}
      for (const s of data) map[s.key] = s.value
      setSettings(map)
      setOriginal(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const changed = Object.entries(settings).filter(([k, v]) => original[k] !== v)
    for (const [key, value] of changed) {
      await db.from('academic_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    }
    setOriginal({ ...settings })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const hasChanges = Object.entries(settings).some(([k, v]) => original[k] !== v)

  // Group settings
  const groups = new Map<string, string[]>()
  for (const [key, config] of Object.entries(SETTING_LABELS)) {
    const existing = groups.get(config.group) ?? []
    existing.push(key)
    groups.set(config.group, existing)
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading settings...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Academic Settings</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Configure semester, enrollment, grading, and payment settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Badge variant="success" label="Saved!" />}
          <Button variant="secondary" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {Array.from(groups.entries()).map(([group, keys]) => (
        <Card key={group}>
          <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {keys.map((key) => {
              const config = SETTING_LABELS[key]!
              const value = settings[key] ?? ''

              if (config.type === 'boolean') {
                return (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)]">{config.label}</label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={value === 'true'}
                      onClick={() => handleChange(key, value === 'true' ? 'false' : 'true')}
                      className={`relative h-6 w-11 rounded-full transition-colors ${value === 'true' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )
              }

              if (config.type === 'number') {
                return (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">{config.label}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-mono"
                    />
                  </div>
                )
              }

              if (config.type === 'date') {
                return (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">{config.label}</label>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                    />
                  </div>
                )
              }

              return (
                <Input key={key} label={config.label} value={value} onChange={(e) => handleChange(key, e.target.value)} />
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}
