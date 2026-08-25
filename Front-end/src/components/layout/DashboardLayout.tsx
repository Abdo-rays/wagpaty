import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { LayoutProvider } from './LayoutContext'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const layout = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen(open => !open),
    closeSidebar: () => setSidebarOpen(false),
  }

  return <LayoutProvider value={layout}>
    <div className="dashboard-layout flex h-screen bg-page overflow-hidden">
      <div className={`sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`} onClick={layout.closeSidebar} />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-page">
        <Outlet />
      </main>
    </div>
  </LayoutProvider>
}
