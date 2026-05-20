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
    return true
  }
}

function AuthCallback() {
  const navigate = useNavigate()
  const { redirect_to } = Route.useSearch()
  const [status, setStatus] = useState('Signing you in…')

  useEffect(() => {
    const destination =
      redirect_to && isSafeRedirect(redirect_to) ? redirect_to : '/dashboard/projects'

    async function exchange() {
      const search = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

      // ── PKCE flow: code in query string ──
      const code = search.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error || !data.session) {
          setStatus(`Error: ${error?.message ?? 'exchange failed'}`)
          return
        }
        doRedirect(data.session.access_token, destination, data.session.refresh_token)
        return
      }

      // ── Implicit flow: tokens in hash ──
      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error || !data.session) {
          setStatus(`Error: ${error?.message ?? 'session failed'}`)
          return
        }
        doRedirect(data.session.access_token, destination, data.session.refresh_token)
        return
      }

      // ── Fallback: maybe session already exists ──
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        doRedirect(session.access_token, destination, session.refresh_token)
        return
      }

      setStatus(`No auth code found — nothing in URL params or hash.`)
    }

    function doRedirect(accessToken: string, destination: string, refreshToken?: string) {
      if (destination.startsWith('http')) {
        const url = new URL(destination)
        url.searchParams.set('mc_token', accessToken)
        if (refreshToken) url.searchParams.set('mc_refresh', refreshToken)
        window.location.href = url.toString()
      } else {
        navigate({ to: destination as '/' })
      }
    }

    exchange()
  }, [navigate, redirect_to])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <span
          className="font-vt323 text-[28px] leading-none text-[#111]"
          style={{ fontFamily: 'var(--font-vt323)' }}
        >
          modecat_
        </span>
        <p className="mt-4 font-mono text-[11px] text-[#888]">{status}</p>
        {status.startsWith('No auth') || status.startsWith('Error') ? (
          <button
            onClick={() => navigate({ to: '/auth/login' })}
            className="mt-6 font-mono text-[10px] text-[#0055AA] underline"
          >
            Back to login
          </button>
        ) : null}
      </div>
    </div>
  )
}
