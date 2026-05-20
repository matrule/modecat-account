import { Link } from '@tanstack/react-router'
import { FolderOpen, Mic2, Cpu, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { to: '/dashboard/samples', label: 'Samples', icon: Mic2 },
  { to: '/dashboard/midi-bridge', label: 'MIDI Bridge', icon: Cpu },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuth()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 56 : 192,
        background: 'var(--surface)',
        borderRight: '0.5px solid var(--border)',
        transition: 'width 150ms ease',
      }}
      className="relative flex h-screen flex-shrink-0 flex-col"
    >
      {/* Logo */}
      <div
        style={{ padding: '17px 16px', borderBottom: '0.5px solid var(--border)' }}
        className="flex items-center justify-between"
      >
        {!sidebarCollapsed && (
          <Link to="/dashboard/projects" className="font-vt323 text-[22px] leading-none text-[#111]">
            modecat_
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex h-9 items-center gap-2.5 px-4 text-[13px] transition-colors',
              'text-[#888] hover:text-[#111]',
            )}
            activeProps={{
              style: {
                color: '#111',
                borderLeft: '3px solid #0055AA',
                paddingLeft: 13, // 16px - 3px border
              },
            }}
          >
            <Icon size={15} strokeWidth={1.6} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div
        style={{ borderTop: '0.5px solid var(--border)', padding: '12px 16px' }}
        className="flex items-center gap-2.5"
      >
        <div
          style={{ background: 'var(--wb-blue)' }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
        >
          <span className="font-mono text-[10px] font-medium text-white">{initials}</span>
        </div>
        {!sidebarCollapsed && (
          <span className="truncate text-[12px] text-[#555]">{user?.email ?? ''}</span>
        )}
      </div>
    </aside>
  )
}
