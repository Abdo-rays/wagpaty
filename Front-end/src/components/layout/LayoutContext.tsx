import { createContext, useContext, type ReactNode } from 'react'

interface LayoutContextValue {
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children, value }: { children: ReactNode; value: LayoutContextValue }) {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  return context || {
    sidebarOpen: false,
    toggleSidebar: () => {},
    closeSidebar: () => {},
  }
}