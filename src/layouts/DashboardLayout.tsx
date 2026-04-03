import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-4 px-4 py-3 bg-background/90 backdrop-blur-md border-b border-outline-variant/10 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline font-bold text-on-background text-lg">The Galary</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 md:px-8 lg:px-10 py-6 md:py-10 lg:py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
