import { useEffect, useState } from 'react'
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

const SAFE_DOMAINS = ['modecat-account.netlify.app', 'app.modecat.net', 'modecat.net', 'localhost']

function isSafeRedirect(url: string): boolean {
  try {
    const parsed = new URL(url)
    return SAFE_DOMAINS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))
  } catch {
    return true // relative path — safe
  }
}

function AuthCallback() {
  const navigate = useNavigate()
  const { redirect_to } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const destination =
      redirect_to && isSafeRedirect(redirect_to) ? redirect_to : '/dashboard/projects'

    async function exchange() {
      // Extract the PKCE code from the URL query string
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        // Explicit PKCE exchange — we control the timing, no race condition
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error || !data.session) {
          setError(error?.message ?? 'Sign-in failed. Please try again.')
          setTimeout(() => navigate({ to: '/auth/login' }), 2000)
          return
        }

        if (destination.startsWith('http')) {
          const url = new URL(destination)
          url.searchParams.set('mc_token', data.session.access_token)
          window.location.href = url.toString()
        } else {
          navigate({ to: destination as '/' })
        }
        return
      }

      // No code in URL — could be a magic link (hash-based) or stale redirect.
      // Check if we already have a valid session.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate({ to: destination as '/' })
      } else {
        setError('No auth code found. Please try signing in again.')
        setTimeout(() => navigate({ to: '/auth/login' }), 2000)
      }
    }

    exchange()
  }, [navigate, redirect_to])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <span
          className="font-vt323 text-[28px] leading-none text-[#111]"
          style={{ fontFamily: 'var(--font-vt323)' }}
        >
          modecat_
        </span>
        <p className="mt-4 font-mono text-[11px] text-[#aaa]">
          {error ?? 'Signing you in…'}
        </p>
      </div>
    </div>
  )
}
