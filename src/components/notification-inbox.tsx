import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronRight,
  CreditCard,
  GraduationCap,
  CalendarClock,
  CalendarDays,
  Megaphone,
  X,
  ExternalLink,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotificationStore, getRelativeTime } from '@/stores/notification-store'
import type { Notification, NotificationPriority, NotificationType } from '@/types/database'

// ---------------------------------------------------------------------------
// Priority section config
// ---------------------------------------------------------------------------
interface PrioritySectionConfig {
  priority: NotificationPriority
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
  dotClass: string
}

const PRIORITY_SECTIONS: PrioritySectionConfig[] = [
  {
    priority: 'action_required',
    label: 'Action Required',
    colorClass: 'text-[var(--color-error)]',
    bgClass: 'bg-[var(--color-error)]/5',
    borderClass: 'border-l-[var(--color-error)]',
    dotClass: 'bg-[var(--color-error)]',
  },
  {
    priority: 'update',
    label: 'Updates',
    colorClass: 'text-[var(--color-warning)]',
    bgClass: 'bg-[var(--color-warning)]/5',
    borderClass: 'border-l-[var(--color-warning)]',
    dotClass: 'bg-[var(--color-warning)]',
  },
  {
    priority: 'info',
    label: 'Informational',
    colorClass: 'text-[var(--color-info)]',
    bgClass: 'bg-[var(--color-info)]/5',
    borderClass: 'border-l-[var(--color-info)]',
    dotClass: 'bg-[var(--color-info)]',
  },
]

// ---------------------------------------------------------------------------
// Notification type to icon mapping
// ---------------------------------------------------------------------------
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'grade_posted':
      return GraduationCap
    case 'payment_status_changed':
      return CreditCard
    case 'enrollment_confirmed':
      return CalendarClock
    case 'deadline_approaching':
      return AlertTriangle
    case 'event_reminder':
      return CalendarDays
    case 'system_announcement':
      return Megaphone
    default:
      return Bell
  }
}

// ---------------------------------------------------------------------------
// Single notification item
// ---------------------------------------------------------------------------
function NotificationItem({
  notification,
  onDismiss,
  onAction,
  borderColor,
}: {
  notification: Notification
  onDismiss: (id: string) => void
  onAction: (url: string) => void
  borderColor: string
}) {
  const Icon = getNotificationIcon(notification.type)

  return (
    <div
      className={`group flex items-start gap-3 border-l-3 px-3 py-3 transition-colors ${
        notification.read
          ? 'opacity-70'
          : 'bg-[var(--color-surface)]'
      }`}
      style={{ borderLeftColor: `var(--color-${borderColor})` }}
    >
      <div className="mt-0.5 shrink-0">
        <Icon
          className="h-5 w-5 text-[var(--color-text-secondary)]"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.read
                ? 'font-normal text-[var(--color-text-secondary)]'
                : 'font-semibold text-[var(--color-text-primary)]'
            }`}
          >
            {!notification.read && (
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]"
                aria-label="Unread"
              />
            )}
            {notification.title}
          </p>

          <button
            onClick={() => onDismiss(notification.id)}
            className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--color-text-secondary)] opacity-0 transition-opacity hover:bg-[var(--color-primary-lighter)] group-hover:opacity-100 focus:opacity-100"
            aria-label={`Dismiss notification: ${notification.title}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
          {notification.body}
        </p>

        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {getRelativeTime(notification.created_at)}
          </span>

          {notification.action_url && (
            <button
              onClick={() => onAction(notification.action_url!)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
            >
              View
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collapsible priority section
// ---------------------------------------------------------------------------
function PrioritySection({
  config,
  notifications,
  defaultExpanded,
  onDismiss,
  onAction,
}: {
  config: PrioritySectionConfig
  notifications: Notification[]
  defaultExpanded: boolean
  onDismiss: (id: string) => void
  onAction: (url: string) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (notifications.length === 0) return null

  const borderColorVar =
    config.priority === 'action_required'
      ? 'error'
      : config.priority === 'update'
        ? 'warning'
        : 'info'

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-primary-lighter)] ${config.bgClass}`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className={`h-4 w-4 ${config.colorClass}`} aria-hidden="true" />
          ) : (
            <ChevronRight className={`h-4 w-4 ${config.colorClass}`} aria-hidden="true" />
          )}
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span
            className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold text-white ${config.dotClass}`}
          >
            {notifications.length}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-[var(--color-border)]">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onDismiss={onDismiss}
              onAction={onAction}
              borderColor={borderColorVar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NotificationInbox (main exported component)
// ---------------------------------------------------------------------------
export function NotificationInbox({ onNavigate }: { onNavigate?: () => void }) {
  const getGrouped = useNotificationStore((s) => s.getGrouped)
  const dismiss = useNotificationStore((s) => s.dismiss)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()

  const grouped = getGrouped()

  const visibleCount = notifications.filter((n) => !n.dismissed).length

  function handleAction(url: string) {
    // Mark notification as read implicitly when user navigates
    navigate(url)
    onNavigate?.()
  }

  function handleDismiss(id: string) {
    dismiss(id)
  }

  if (visibleCount === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Info className="h-8 w-8 text-[var(--color-text-secondary)]" aria-hidden="true" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          No notifications right now. Check back later!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header row with mark-all-read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {unreadCount} unread
          </span>
          <Button variant="ghost" className="!text-xs !min-h-0 !px-2 !py-1" onClick={() => markAllRead()}>
            Mark all as read
          </Button>
        </div>
      )}

      {PRIORITY_SECTIONS.map((config) => (
        <PrioritySection
          key={config.priority}
          config={config}
          notifications={grouped[config.priority]}
          defaultExpanded={config.priority === 'action_required'}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />
      ))}
    </div>
  )
}
