import { Outlet, useRouterState } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Routes where we suppress the dashboard shell (auth pages, docs). */
const SHELL_EXCLUDED_PREFIXES = ['/auth/', '/docs/']

export function AppShell() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const showShell = !SHELL_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!showShell) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
