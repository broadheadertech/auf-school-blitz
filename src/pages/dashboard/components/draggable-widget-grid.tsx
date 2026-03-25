import { useState, useCallback, type DragEvent, type ReactNode } from 'react'
import { GripVertical, X } from 'lucide-react'
import type { WidgetConfig } from '@/stores/dashboard-store'

interface DraggableWidgetGridProps {
  widgets: WidgetConfig[]
  isEditing: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove?: (widgetId: string) => void
  renderWidget: (widget: WidgetConfig) => ReactNode
}

export function DraggableWidgetGrid({
  widgets,
  isEditing,
  onReorder,
  onRemove,
  renderWidget,
}: DraggableWidgetGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, index: number) => {
      setDragIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(index))
    },
    [],
  )

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDropIndex(index)
    },
    [],
  )

  const handleDragLeave = useCallback(() => {
    setDropIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, toIndex: number) => {
      e.preventDefault()
      const fromIndex = Number(e.dataTransfer.getData('text/plain'))
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex)
      }
      setDragIndex(null)
      setDropIndex(null)
    },
    [onReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  // Track original indices so reorder operates on the full widgets array
  const visibleWidgetsWithIndex = widgets
    .map((w, originalIndex) => ({ widget: w, originalIndex }))
    .filter((item) => item.widget.visible)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {visibleWidgetsWithIndex.map(({ widget, originalIndex: index }) => {
        // Some widgets (welcome, notifications) should span full width
        const isFullWidth = widget.type === 'welcome' || widget.type === 'notifications' || widget.type === 'deadlines' || widget.type === 'quick-links'
        const isDragging = dragIndex === index
        const isDropTarget = dropIndex === index && dropIndex !== dragIndex

        return (
          <div
            key={widget.id}
            draggable={isEditing}
            onDragStart={isEditing ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={isEditing ? (e) => handleDragOver(e, index) : undefined}
            onDragLeave={isEditing ? handleDragLeave : undefined}
            onDrop={isEditing ? (e) => handleDrop(e, index) : undefined}
            onDragEnd={isEditing ? handleDragEnd : undefined}
            className={`
              ${isFullWidth ? 'sm:col-span-2 xl:col-span-3' : ''}
              ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
              ${isDragging ? 'opacity-50' : ''}
              ${isDropTarget ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 rounded-[var(--radius-lg)]' : ''}
              transition-all duration-150
            `.trim()}
          >
            {isEditing && (
              <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1">
                  <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="capitalize">{widget.type.replace('-', ' ')}</span>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(widget.id) }}
                    className="rounded-full p-0.5 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors"
                    aria-label={`Remove ${widget.type.replace('-', ' ')} widget`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {renderWidget(widget)}
          </div>
        )
      })}
    </div>
  )
}
