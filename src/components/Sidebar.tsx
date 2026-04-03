import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Library', icon: 'video_library', href: '/library' },
  { label: 'Upload', icon: 'cloud_upload', href: '/upload' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  user?: { name: string; plan: string; avatarInitial?: string }
}

function SidebarContent({
  user,
  onClose,
}: {
  user: NonNullable<SidebarProps['user']>
  onClose?: () => void
}) {
  const { pathname } = useLocation()
  return (
    <>
      {/* Brand */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-background">The Galary</h1>
          <p className="text-sm opacity-60 text-on-surface font-body">Video Manager</p>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, icon, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-primary-container/30'
                  : 'text-on-surface opacity-70 hover:bg-surface-container-low hover:opacity-100'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-low">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="font-headline font-bold text-on-primary-container text-sm">
              {user.avatarInitial}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-on-background">{user.name}</p>
            <p className="text-xs opacity-50 truncate text-on-surface">{user.plan}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
  user = { name: 'Alex Rivera', plan: 'Pro Plan', avatarInitial: 'A' },
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-inverse-surface/30 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col py-8 px-6
          bg-background border-r border-outline-variant/20 font-headline tracking-tight
          transform transition-transform duration-300
          lg:static lg:translate-x-0 lg:h-full lg:shrink-0 lg:z-auto
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent user={user} onClose={onMobileClose} />
      </aside>
    </>
  )
}
