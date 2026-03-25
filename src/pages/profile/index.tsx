import { useState } from 'react'
import { User, Moon, Sun, Eye, Type, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore } from '@/stores/theme-store'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, role, profile, fetchProfile } = useAuthStore()
  const { mode, toggle: toggleTheme } = useThemeStore()

  const profileAny = profile as Record<string, unknown> | null
  const displayName = profileAny
    ? `${String(profileAny.first_name ?? '')} ${String(profileAny.last_name ?? '')}`.trim()
    : user?.email ?? 'User'

  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(String(profileAny?.first_name ?? ''))
  const [lastName, setLastName] = useState(String(profileAny?.last_name ?? ''))
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const table = role === 'student' ? 'students' : role === 'faculty' ? 'faculty' : 'admin_staff'

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMsg('')
    const { error } = await (supabase as any).from(table).update({ first_name: firstName, last_name: lastName }).eq('user_id', user.id)
    if (error) {
      setSaveMsg(`Error: ${error.message}`)
    } else {
      setSaveMsg('Saved!')
      setEditing(false)
      if (user) fetchProfile(user.id, role!)
      setTimeout(() => setSaveMsg(''), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1>Profile & Settings</h1>

      {/* User info */}
      <Card className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <User className="h-7 w-7" />
        </div>
        {editing ? (
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                {displayName}
              </p>
              <button type="button" onClick={() => { setFirstName(String(profileAny?.first_name ?? '')); setLastName(String(profileAny?.last_name ?? '')); setEditing(true) }} className="text-xs text-[var(--color-accent)] hover:underline">
                Edit
              </button>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
            <p className="text-xs text-[var(--color-text-secondary)] capitalize">{role}</p>
            {saveMsg && <p className="text-xs text-[var(--color-success)]">{saveMsg}</p>}
          </div>
        )}
      </Card>

      {/* Theme settings */}
      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
          Appearance
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'light' ? <Sun className="h-5 w-5 text-[var(--color-accent)]" /> : <Moon className="h-5 w-5 text-[var(--color-accent)]" />}
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Dark Mode</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {mode === 'light' ? 'Currently using light theme' : 'Currently using dark theme'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={mode === 'dark'}
              aria-label="Toggle dark mode"
              className={`relative h-6 w-11 rounded-full transition-colors ${mode === 'dark' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${mode === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Accessibility settings */}
      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-text-primary)]">
          Accessibility
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">High Contrast</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Increase contrast for better readability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Text Size</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Use browser zoom (Ctrl/Cmd + or -) to adjust text size
              </p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              AUF Portal is designed to be keyboard-navigable. Use Tab to move between elements, Enter/Space to activate, and Escape to close dialogs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
