import { type ReactNode, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  /** Where to send unauthenticated users. Defaults to /auth/login. */
  redirectTo?: string
}

/**
 * Wrap any page that requires authentication.
 * Redirects unauthenticated visitors to the login page,
 * preserving the current URL as `redirect_to` so they land back
 * here after signing in.
 */
export function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: redirectTo as '/auth/login',
        search: { redirect_to: window.location.pathname + window.location.search },
      })
    }
  }, [user, loading, navigate, redirectTo])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-xs text-gray-400">Loading…</span>
      </div>
    )
  }

  if (!user) {
    // Render nothing while the redirect fires
    return null
  }

  return <>{children}</>
}
