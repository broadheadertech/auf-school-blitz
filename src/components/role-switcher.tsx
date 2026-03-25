import { useState, useRef, useEffect } from 'react'
import { Shield, BookOpen, GraduationCap, ChevronDown, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', icon: Shield },
  faculty: { label: 'Faculty', icon: BookOpen },
  student: { label: 'Student', icon: GraduationCap },
}

export function RoleSwitcher() {
  const role = useAuthStore((s) => s.role)
  const availableRoles = useAuthStore((s) => s.availableRoles)
  const loading = useAuthStore((s) => s.loading)
  const switchRole = useAuthStore((s) => s.switchRole)

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Only show when user has multiple roles
  if (!role || availableRoles.length <= 1) return null

  const currentConfig = roleConfig[role]
  const CurrentIcon = currentConfig.icon

  const handleSwitch = async (newRole: UserRole) => {
    if (newRole === role) {
      setOpen(false)
      return
    }
    await switchRole(newRole)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current role: ${currentConfig.label}. Switch role.`}
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
      >
        <CurrentIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left font-medium">{currentConfig.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select role"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-[var(--color-primary)] shadow-lg"
        >
          {availableRoles.map((r) => {
            const config = roleConfig[r]
            const Icon = config.icon
            const isActive = r === role
            return (
              <li key={r} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSwitch(r)}
                  disabled={loading}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{config.label}</span>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
