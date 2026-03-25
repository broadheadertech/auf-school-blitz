import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CalendarPlus,
  Wallet,
  Newspaper,
  CalendarDays,
  User,
  LogOut,
  Users,
  ClipboardList,
  Settings,
  Calendar,
  Calculator,
  FileText,
  CheckSquare,
  MessageSquare,
  Star,
  Clock,
  FolderOpen,
  Megaphone,
  BarChart3,
  Award,
  Shield,
  UsersRound,
  MapPin,
  Search,
  Trophy,
} from 'lucide-react'
import { RoleSwitcher } from '@/components/role-switcher'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[] // If undefined, visible to all roles
}

const allNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['student', 'faculty'] },
  { to: '/grades', label: 'Grades', icon: BookOpen, roles: ['student', 'faculty'] },
  { to: '/curriculum', label: 'Curriculum', icon: GraduationCap, roles: ['student'] },
  { to: '/enrollment', label: 'Enrollment', icon: CalendarPlus, roles: ['student', 'admin'] },
  { to: '/payments', label: 'Payments', icon: Wallet, roles: ['student', 'admin'] },
  { to: '/documents', label: 'Documents', icon: FileText, roles: ['student', 'admin'] },
  { to: '/clearance', label: 'Clearance', icon: CheckSquare, roles: ['student', 'admin'] },
  { to: '/gpa-calculator', label: 'GPA Calculator', icon: Calculator, roles: ['student'] },
  // Faculty
  { to: '/grades/submit', label: 'Grade Submission', icon: ClipboardList, roles: ['faculty'] },
  { to: '/attendance', label: 'Attendance', icon: Clock, roles: ['faculty'] },
  { to: '/materials', label: 'Materials', icon: FolderOpen, roles: ['faculty'] },
  { to: '/consultations', label: 'Consultations', icon: MessageSquare, roles: ['student', 'faculty'] },
  // Admin
  { to: '/admin/academic', label: 'Academic Setup', icon: GraduationCap, roles: ['admin'] },
  { to: '/admin/sections', label: 'Sections', icon: CalendarPlus, roles: ['admin'] },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  { to: '/admin/scholarships', label: 'Scholarships', icon: Award, roles: ['admin'] },
  { to: '/admin/audit', label: 'Audit Log', icon: Shield, roles: ['admin'] },
  { to: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
]

const infoNav: NavItem[] = [
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/campus-map', label: 'Campus Map', icon: MapPin },
]

const communityNav: NavItem[] = [
  { to: '/chat', label: 'Messages', icon: MessageSquare },
  { to: '/reviews', label: 'Course Reviews', icon: Star },
  { to: '/study-groups', label: 'Study Groups', icon: UsersRound },
  { to: '/lost-found', label: 'Lost & Found', icon: Search },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

const accountNav: NavItem[] = [
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const role = useAuthStore((s) => s.role)

  const visibleMain = allNav.filter((item) => !item.roles || (role && item.roles.includes(role)))
  const visibleInfo = infoNav.filter((item) => !item.roles || (role && item.roles.includes(role)))

  return (
    <nav
      aria-label="Main navigation"
      className="hidden xl:flex flex-col w-60 min-h-screen bg-[var(--color-primary)] text-white"
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <GraduationCap className="h-8 w-8 text-[var(--color-accent)]" />
        <span className="font-display text-lg font-bold">UniPortal</span>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-2 py-3">
        {visibleMain.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        <div className="my-2 border-t border-white/10" />

        {visibleInfo.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        <div className="my-2 border-t border-white/10" />

        {communityNav.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        <div className="my-2 border-t border-white/10" />

        {accountNav.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>

      <div className="px-2 pb-4 space-y-1">
        <div className="border-t border-white/10 pt-2 mb-1">
          <RoleSwitcher />
        </div>
        <button
          onClick={async () => { await logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  )
}

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-white/10 text-white border-l-[3px] border-[var(--color-accent)]'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  )
}
