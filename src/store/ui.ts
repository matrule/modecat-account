import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  /** Whether the sidebar is collapsed to icon-only mode. */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

/**
 * Global UI state, persisted to localStorage under the key 'modecat-ui'.
 * Only contains lightweight presentation state — no auth or server data.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: 'modecat-ui' },
  ),
)
