import { useEffect, useRef, useState } from 'react'
import { Bell, GraduationCap, Sun, Moon } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { useThemeStore } from '@/stores/theme-store'
import { NotificationInbox } from '@/components/notification-inbox'
import { GlobalSearch } from '@/components/search/global-search'

export function Header() {
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const { mode, toggle: toggleTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <div className="flex items-center gap-2 xl:hidden">
        <GraduationCap className="h-7 w-7 text-[var(--color-accent)]" />
        <span className="font-display text-base font-bold text-[var(--color-primary)]">
          ASU Portal
        </span>
      </div>

      <div className="hidden xl:flex xl:flex-1 xl:justify-center">
        <GlobalSearch />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)] transition-colors"
      >
        {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      {/* Notification bell + dropdown */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={open}
          aria-haspopup="true"
          className="relative rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)]"
          >
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              Notifications
            </h3>
            <NotificationInbox onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
    </header>
  )
}
