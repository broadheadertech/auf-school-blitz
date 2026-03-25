import { create } from 'zustand'
import type { Notification, NotificationPriority } from '@/types/database'

// ---------------------------------------------------------------------------
// Relative time helper (no external dependency)
// ---------------------------------------------------------------------------
function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export { getRelativeTime }

// ---------------------------------------------------------------------------
// Mock notification data (no DB table yet — MVP)
// ---------------------------------------------------------------------------
function createMockNotifications(): Notification[] {
  const now = Date.now()
  return [
    {
      id: 'n1',
      user_id: 'mock-user',
      type: 'payment_status_changed',
      priority: 'action_required',
      title: 'Tuition payment overdue',
      body: 'Your tuition balance of \u20B112,450.00 is past due. Please upload proof of payment.',
      action_url: '/payments',
      read: false,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
      id: 'n2',
      user_id: 'mock-user',
      type: 'deadline_approaching',
      priority: 'action_required',
      title: 'Enrollment closes in 2 days',
      body: 'Add/drop period ends March 20, 2026. Finalize your schedule now.',
      action_url: '/enrollment',
      read: false,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'n3',
      user_id: 'mock-user',
      type: 'grade_posted',
      priority: 'update',
      title: 'New grade posted: CS 201',
      body: 'Your midterm grade for CS 201 (Data Structures) has been submitted.',
      action_url: '/grades',
      read: false,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: 'n4',
      user_id: 'mock-user',
      type: 'payment_status_changed',
      priority: 'update',
      title: 'Payment verified',
      body: 'Your payment of \u20B15,000.00 (Ref: GCash-12345) has been verified and posted.',
      action_url: '/payments',
      read: false,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: 'n5',
      user_id: 'mock-user',
      type: 'enrollment_confirmed',
      priority: 'update',
      title: 'Enrollment confirmed',
      body: 'Your enrollment for 2nd Semester AY 2025-2026 has been confirmed. 21 units total.',
      action_url: '/enrollment',
      read: true,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
      id: 'n6',
      user_id: 'mock-user',
      type: 'event_reminder',
      priority: 'info',
      title: 'Upcoming: University Foundation Day',
      body: 'Foundation Day celebration on March 25, 2026 at the University Gymnasium.',
      action_url: '/events',
      read: false,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    },
    {
      id: 'n7',
      user_id: 'mock-user',
      type: 'system_announcement',
      priority: 'info',
      title: 'System maintenance notice',
      body: 'UniPortal will undergo scheduled maintenance on March 22, 2026 from 2:00-4:00 AM.',
      action_url: null,
      read: true,
      dismissed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    },
  ]
}

// ---------------------------------------------------------------------------
// Grouped notifications type
// ---------------------------------------------------------------------------
export interface GroupedNotifications {
  action_required: Notification[]
  update: Notification[]
  info: Notification[]
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

interface NotificationActions {
  fetchNotifications: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  getGrouped: () => GroupedNotifications
  subscribe: () => () => void
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  (set, get) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: () => {
      const notifications = createMockNotifications()
      const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
      set({ notifications, unreadCount })
    },

    markRead: (id: string) => {
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        )
        const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
        return { notifications, unreadCount }
      })
    },

    markAllRead: () => {
      set((state) => {
        const notifications = state.notifications.map((n) => ({ ...n, read: true }))
        return { notifications, unreadCount: 0 }
      })
    },

    dismiss: (id: string) => {
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, dismissed: true } : n,
        )
        const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
        return { notifications, unreadCount }
      })
    },

    getGrouped: (): GroupedNotifications => {
      const { notifications } = get()
      const visible = notifications.filter((n) => !n.dismissed)
      const grouped: GroupedNotifications = {
        action_required: [],
        update: [],
        info: [],
      }
      for (const n of visible) {
        grouped[n.priority].push(n)
      }
      return grouped
    },

    // MVP: simulate Supabase Realtime subscription.
    // In production this will use supabase.channel('notifications')...
    subscribe: () => {
      // Load initial mock data
      get().fetchNotifications()

      // Simulate a real-time notification arriving after 30 seconds
      const timer = setTimeout(() => {
        set((state) => {
          const newNotification: Notification = {
            id: `n-rt-${Date.now()}`,
            user_id: 'mock-user',
            type: 'grade_posted',
            priority: 'update' as NotificationPriority,
            title: 'New grade posted: MATH 101',
            body: 'Your final grade for MATH 101 (Calculus I) has been submitted.',
            action_url: '/grades',
            read: false,
            dismissed: false,
            created_at: new Date().toISOString(),
          }
          const notifications = [newNotification, ...state.notifications]
          const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
          return { notifications, unreadCount }
        })
      }, 30000)

      // Return unsubscribe function
      return () => {
        clearTimeout(timer)
      }
    },
  }),
)
