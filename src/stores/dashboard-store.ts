import { create } from 'zustand'

export type WidgetType =
  | 'welcome'
  | 'notifications'
  | 'deadlines'
  | 'grades'
  | 'enrollment'
  | 'payments'
  | 'news'
  | 'events'
  | 'curriculum'
  | 'quick-links'

export interface WidgetConfig {
  id: string
  type: WidgetType
  visible: boolean
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'w-welcome', type: 'welcome', visible: true },
  { id: 'w-notifications', type: 'notifications', visible: true },
  { id: 'w-deadlines', type: 'deadlines', visible: true },
  { id: 'w-quick-links', type: 'quick-links', visible: true },
]

function getStorageKey(userId?: string): string {
  return userId
    ? `uniportal_dashboard_layout_${userId}`
    : 'uniportal_dashboard_layout'
}

function loadLayout(userId?: string): WidgetConfig[] {
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    if (stored) {
      const parsed = JSON.parse(stored) as WidgetConfig[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return DEFAULT_LAYOUT
}

function saveLayout(layout: WidgetConfig[], userId?: string): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(layout))
  } catch {
    // localStorage unavailable
  }
}

let currentUserId: string | undefined

interface DashboardState {
  widgets: WidgetConfig[]
  isEditing: boolean
  setEditing: (editing: boolean) => void
  reorderWidgets: (fromIndex: number, toIndex: number) => void
  addWidget: (type: WidgetType) => void
  removeWidget: (widgetId: string) => void
  resetLayout: () => void
  loadUserLayout: (userId: string) => void
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  widgets: loadLayout(),
  isEditing: false,

  setEditing: (editing) => {
    if (!editing) {
      saveLayout(get().widgets, currentUserId)
    }
    set({ isEditing: editing })
  },

  reorderWidgets: (fromIndex, toIndex) => {
    set((state) => {
      const widgets = [...state.widgets]
      const [moved] = widgets.splice(fromIndex, 1)
      if (moved) {
        widgets.splice(toIndex, 0, moved)
      }
      return { widgets }
    })
  },

  addWidget: (type) => {
    set((state) => {
      const exists = state.widgets.some((w) => w.type === type && w.visible)
      if (exists) return state
      // Check if widget exists but is hidden
      const hidden = state.widgets.find((w) => w.type === type && !w.visible)
      if (hidden) {
        return {
          widgets: state.widgets.map((w) =>
            w.id === hidden.id ? { ...w, visible: true } : w,
          ),
        }
      }
      // Add new widget
      return {
        widgets: [
          ...state.widgets,
          { id: `w-${type}-${Date.now()}`, type, visible: true },
        ],
      }
    })
  },

  removeWidget: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: false } : w,
      ),
    }))
  },

  resetLayout: () => {
    saveLayout(DEFAULT_LAYOUT, currentUserId)
    set({ widgets: DEFAULT_LAYOUT })
  },

  loadUserLayout: (userId) => {
    currentUserId = userId
    set({ widgets: loadLayout(userId) })
  },
}))
