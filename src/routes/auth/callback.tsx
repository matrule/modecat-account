import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type Session } from '@supabase/supabase-js'
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

  useEffect(() => {
    const destination =
      redirect_to && isSafeRedirect(redirect_to) ? redirect_to : '/dashboard/projects'

    function doRedirect(session: Session) {
      if (destination.startsWith('http')) {
        const url = new URL(destination)
        url.searchParams.set('mc_token', session.access_token)
        window.location.href = url.toString()
      } else {
        navigate({ to: destination as '/' })
      }
    }

    let timeout: ReturnType<typeof setTimeout>

    // Supabase may have already exchanged the OAuth code by the time this
    // component mounts — check for an existing session first.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Session already ready — redirect immediately
        doRedirect(session)
        return
      }

      // Not ready yet — wait for SIGNED_IN (exchange still in progress)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          clearTimeout(timeout)
          doRedirect(session)
        }
      })

      // Safety net: give up after 10s and send to login
      timeout = setTimeout(() => {
        subscription.unsubscribe()
        navigate({ to: '/auth/login' })
      }, 10000)
    })

    return () => {
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
