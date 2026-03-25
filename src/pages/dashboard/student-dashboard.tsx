import { useEffect, useState } from 'react'
import { Settings, X, Plus } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useNotificationStore } from '@/stores/notification-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { DraggableWidgetGrid } from './components/draggable-widget-grid'
import { renderWidget } from './components/widget-renderer'
import { WidgetCatalog } from './components/widget-catalog'

export function StudentDashboard() {
  const subscribe = useNotificationStore((s) => s.subscribe)
  const userId = useAuthStore((s) => s.user?.id)
  const { widgets, isEditing, setEditing, reorderWidgets, addWidget, removeWidget, loadUserLayout } = useDashboardStore()
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe()
    return () => unsubscribe()
  }, [subscribe])

  // Load user-specific layout on mount
  useEffect(() => {
    if (userId) loadUserLayout(userId)
  }, [userId, loadUserLayout])

  return (
    <div className="space-y-6">
      {/* Edit mode toggle */}
      <div className="flex justify-end gap-2">
        {isEditing && (
          <Button variant="secondary" onClick={() => setCatalogOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Widget
          </Button>
        )}
        {isEditing ? (
          <Button variant="primary" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" aria-hidden="true" />
            Done
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            Customize
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/5 px-4 py-2 text-center text-sm text-[var(--color-text-secondary)]">
          Drag widgets to reorder. Use &quot;Add Widget&quot; to add more. Click the X to remove. Click &quot;Done&quot; when finished.
        </div>
      )}

      <DraggableWidgetGrid
        widgets={widgets}
        isEditing={isEditing}
        onReorder={reorderWidgets}
        onRemove={isEditing ? removeWidget : undefined}
        renderWidget={renderWidget}
      />

      <WidgetCatalog
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        currentWidgets={widgets}
        onAdd={addWidget}
      />
    </div>
  )
}
