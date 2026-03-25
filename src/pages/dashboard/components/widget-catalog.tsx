import { Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WidgetType, WidgetConfig } from '@/stores/dashboard-store'

const AVAILABLE_WIDGETS: { type: WidgetType; label: string; description: string }[] = [
  { type: 'welcome', label: 'Welcome Banner', description: 'Your name, program, and year level' },
  { type: 'notifications', label: 'Notifications', description: 'Priority inbox with alerts' },
  { type: 'deadlines', label: 'Deadlines', description: 'Countdown timers for due dates' },
  { type: 'quick-links', label: 'Quick Links', description: 'Module navigation cards' },
  { type: 'grades', label: 'Grades Summary', description: 'Current semester GWA' },
  { type: 'events', label: 'Upcoming Events', description: 'Next 3 events' },
  { type: 'news', label: 'Latest News', description: 'Recent announcements' },
  { type: 'curriculum', label: 'Degree Progress', description: 'Units completed overview' },
]

interface WidgetCatalogProps {
  open: boolean
  onClose: () => void
  currentWidgets: WidgetConfig[]
  onAdd: (type: WidgetType) => void
}

export function WidgetCatalog({ open, onClose, currentWidgets, onAdd }: WidgetCatalogProps) {
  if (!open) return null

  const activeTypes = new Set(currentWidgets.filter((w) => w.visible).map((w) => w.type))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Widget catalog">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Add Widget
          </h2>
          <button type="button" onClick={onClose} className="rounded-[var(--radius-md)] p-1 hover:bg-[var(--color-border)]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {AVAILABLE_WIDGETS.map((widget) => {
            const isActive = activeTypes.has(widget.type)
            return (
              <div
                key={widget.type}
                className={`flex items-center justify-between rounded-[var(--radius-md)] border p-3 ${
                  isActive ? 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-60' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{widget.label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{widget.description}</p>
                </div>
                {isActive ? (
                  <span className="text-xs text-[var(--color-text-secondary)]">Added</span>
                ) : (
                  <Button variant="primary" onClick={() => { onAdd(widget.type); onClose() }}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
