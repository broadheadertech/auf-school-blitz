import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { Header } from './header'
import { PeerTipsButton } from '@/components/peer-tips'
import { PushNotificationPrompt } from '@/components/push-notification-prompt'
import { useAuthStore } from '@/stores/auth-store'

type TipContext = 'dashboard' | 'grades' | 'enrollment' | 'events' | 'payments' | 'curriculum'

const ROUTE_CONTEXT: Record<string, TipContext> = {
  '/dashboard': 'dashboard',
  '/': 'dashboard',
  '/grades': 'grades',
  '/enrollment': 'enrollment',
  '/events': 'events',
  '/payments': 'payments',
  '/curriculum': 'curriculum',
}

export function PageLayout() {
  const location = useLocation()
  const role = useAuthStore((s) => s.role)
  const tipContext = ROUTE_CONTEXT[location.pathname]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 pb-20 xl:p-6 xl:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      {role === 'student' && tipContext && <PeerTipsButton pageContext={tipContext} />}
      <PushNotificationPrompt />
    </div>
  )
}
