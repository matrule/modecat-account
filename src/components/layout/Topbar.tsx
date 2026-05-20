import { useRouterState, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

/** Map route paths to human-readable page titles. */
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/projects': 'Projects',
  '/dashboard/samples': 'Samples',
  '/dashboard/midi-bridge': 'MIDI Bridge',
  '/dashboard/settings': 'Settings',
  '/dashboard/settings/account': 'Account',
  '/docs': 'Docs',
}

export function Topbar() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  // Find the most-specific matching title
  const title =
    Object.entries(ROUTE_TITLES)
      .sort(([a], [b]) => b.length - a.length) // longest match first
      .find(([path]) => pathname.startsWith(path))?.[1] ?? ''

  const showNewProject = pathname.startsWith('/dashboard/projects')

  return (
    <header
      style={{ borderBottom: '0.5px solid var(--border)' }}
      className="flex h-12 flex-shrink-0 items-center justify-between bg-white px-5"
    >
      <span className="text-[15px] font-medium text-[#111]">{title}</span>

      {showNewProject && (
        <Link
          to="/dashboard/projects/new"
          style={{ background: 'var(--wb-blue)', borderRadius: 'var(--border-radius-md)' }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
        >
          <Plus size={13} />
          New project
        </Link>
      )}
    </header>
  )
}
