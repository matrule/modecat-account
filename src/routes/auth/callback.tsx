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

const SAFE_DOMAINS = ['modecat-account.netlify.app', 'app.modecat.net', 'modecat.net', 'localhost']

function isSafeRedirect(url: string): boolean {
  try {
    const parsed = new URL(url)
    return SAFE_DOMAINS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))
  } catch {
    // Relative path — safe
    return true
  }
}

function AuthCallback() {
  const navigate = useNavigate()
  const { redirect_to } = Route.useSearch()

  useEffect(() => {
    const destination =
      redirect_to && isSafeRedirect(redirect_to) ? redirect_to : '/dashboard/projects'

    // Supabase exchanges the OAuth code / magic-link token asynchronously.
    // Listening to onAuthStateChange ensures we act only after the session
    // is fully established, regardless of timing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()

        if (destination.startsWith('http')) {
          // Cross-domain tracker flow — pass token back as query param
          const url = new URL(destination)
          url.searchParams.set('mc_token', session.access_token)
          window.location.href = url.toString()
        } else {
          navigate({ to: destination as '/' })
        }
      }

      // Do NOT redirect on INITIAL_SESSION with no session — the OAuth code
      // exchange is async and INITIAL_SESSION fires before it completes.
      // The 8-second timeout below handles the genuine failure case.
    })

    // Safety net: if nothing fires in 8 seconds, bail to login
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      navigate({ to: '/auth/login' })
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
        <p className="mt-4 font-mono text-[11px] text-[#aaa]">Signing you in…</p>
      </div>
    </div>
  )
}
