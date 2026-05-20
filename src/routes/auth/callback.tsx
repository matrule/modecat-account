import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

interface CallbackSearch {
  redirect_to?: string
}

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    redirect_to: typeof search.redirect_to === 'string' ? search.redirect_to : undefined,
  }),
  component: AuthCallback,
})

/**
 * Handles:
 *  1. OAuth provider redirects (GitHub, Google) — Supabase exchanges the code automatically
 *  2. Magic link clicks — Supabase exchanges the token automatically
 *  3. Cross-domain login from modecat.net — passes a short-lived access token as a query param,
 *     which we use to set the session, then redirect back
 *
 * After any successful session exchange, we redirect to redirect_to (if safe) or /dashboard/projects.
 */
function AuthCallback() {
  const navigate = useNavigate()
  const { redirect_to } = Route.useSearch()

  useEffect(() => {
    async function handleCallback() {
      // Supabase SDK detects the token/code in the URL hash/query and sets the session
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        // Failed — send back to login
        navigate({ to: '/auth/login' })
        return
      }

      // Guard against open-redirect: only allow same-origin or modecat.net
      const safeDomains = ['app.modecat.net', 'modecat.net', 'localhost']
      let destination = '/dashboard/projects'

      if (redirect_to) {
        try {
          const url = new URL(redirect_to)
          if (safeDomains.some((d) => url.hostname === d || url.hostname.endsWith(`.${d}`))) {
            destination = redirect_to
          }
        } catch {
          // redirect_to was a relative path, which is fine
          destination = redirect_to
        }
      }

      // If destination is external (cross-domain tracker flow), do a full redirect
      if (destination.startsWith('http')) {
        const token = data.session.access_token
        const url = new URL(destination)
        url.searchParams.set('mc_token', token)
        window.location.href = url.toString()
      } else {
        navigate({ to: destination as '/' })
      }
    }

    handleCallback()
  }, [navigate, redirect_to])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-sm text-gray-400">Signing you in…</p>
    </div>
  )
}
