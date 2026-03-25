import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, CalendarPlus, Wallet, Menu, Users, Settings, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'

interface Tab {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[]
}

const allTabs: Tab[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/grades', label: 'Grades', icon: BookOpen, roles: ['student', 'faculty'] },
  { to: '/enrollment', label: 'Enroll', icon: CalendarPlus, roles: ['student'] },
  { to: '/payments', label: 'Pay', icon: Wallet, roles: ['student'] },
  { to: '/grades/submit', label: 'Grades', icon: ClipboardList, roles: ['faculty'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/admin/sections', label: 'Sections', icon: Settings, roles: ['admin'] },
  { to: '/profile', label: 'More', icon: Menu },
]

export function BottomNav() {
  const role = useAuthStore((s) => s.role)
  const tabs = allTabs.filter((t) => !t.roles || (role && t.roles.includes(role)))

  return (
    <nav
      aria-label="Mobile navigation"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-1 safe-area-pb"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] min-w-[56px] min-h-[44px] justify-center transition-colors ${
              isActive
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-secondary)]'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
