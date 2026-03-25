import { type ReactNode } from 'react'
import {
  BookOpen,
  CalendarPlus,
  Wallet,
  Newspaper,
  CalendarDays,
  GraduationCap,
} from 'lucide-react'
import type { WidgetConfig } from '@/stores/dashboard-store'
import { WelcomeBanner } from './welcome-banner'
import { DeadlineSection } from './deadline-section'
import { ModuleCard } from './module-card'
import { StreakWidget } from './streak-widget'
import { SemesterWrapped } from './semester-wrapped'
import { NotificationInbox } from '@/components/notification-inbox'
import { Card } from '@/components/ui/card'

const quickAccessModules = [
  { icon: BookOpen, title: 'Grades', description: 'View your semester grades and GWA', to: '/grades' },
  { icon: CalendarPlus, title: 'Enrollment', description: 'Enroll in subjects for the semester', to: '/enrollment' },
  { icon: Wallet, title: 'Payments', description: 'Check balance and upload payment proof', to: '/payments' },
  { icon: Newspaper, title: 'News', description: 'Latest university announcements', to: '/news' },
  { icon: CalendarDays, title: 'Events', description: 'Upcoming events and activities', to: '/events' },
  { icon: GraduationCap, title: 'Curriculum', description: 'View your degree progress', to: '/curriculum' },
] as const

export function renderWidget(widget: WidgetConfig): ReactNode {
  switch (widget.type) {
    case 'welcome':
      return <WelcomeBanner />

    case 'notifications':
      return (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Notifications
          </h2>
          <Card>
            <NotificationInbox />
          </Card>
        </section>
      )

    case 'deadlines':
      return <DeadlineSection />

    case 'quick-links':
      return (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickAccessModules.map((mod) => (
              <ModuleCard key={mod.to} {...mod} />
            ))}
          </div>
        </section>
      )

    case 'grades':
      return <StreakWidget />

    case 'events':
      return <SemesterWrapped />

    // Placeholder widgets — content not yet available as standalone dashboard cards
    case 'enrollment':
    case 'payments':
    case 'news':
    case 'curriculum':
      return null

    default:
      return null
  }
}
