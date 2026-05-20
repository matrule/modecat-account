import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

interface LoginSearch {
  redirect_to?: string
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect_to: typeof search.redirect_to === 'string' ? search.redirect_to : undefined,
  }),
  component: LoginPage,
})

// ─── Shared input style ───────────────────────────────────────────────────────
const inputClass = [
  'w-full px-3 py-2 text-[13px]',
  'border border-[#ccc] bg-white',
  'focus:outline-none focus:border-[#0055AA]',
  'placeholder:text-[#bbb]',
].join(' ')

const errorClass = 'text-[11px] font-mono text-red-500 mt-1'

// ─── Google button ─────────────────────────────────────────────────────────────
function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{ border: '1px solid #ddd' }}
      className="flex w-full items-center justify-center gap-2.5 bg-white px-4 py-2 text-[13px] text-[#333] transition-colors hover:bg-[#f9f9f9] disabled:opacity-50"
    >
      {/* Google "G" SVG */}
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.34-8.16 2.34-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[#e8e8e8]" />
      <span className="font-mono text-[10px] text-[#bbb]">OR</span>
      <div className="h-px flex-1 bg-[#e8e8e8]" />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate()
  const { redirect_to } = Route.useSearch()

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const destination = redirect_to ?? '/dashboard/projects'

  function clearState() {
    setError(null)
    setSuccessMsg(null)
  }

  // ── Email / password submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearState()

    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate({ to: destination as '/' })
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccessMsg('Check your email to confirm your account, then come back to log in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──
  async function handleGoogle() {
    clearState()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirect_to ? `?redirect_to=${encodeURIComponent(redirect_to)}` : ''}`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success the browser navigates away — no further action needed
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div className="mb-8 text-center">
          <span
            className="font-vt323 text-[28px] leading-none text-[#111]"
            style={{ fontFamily: 'var(--font-vt323)' }}
          >
            modecat_
          </span>
        </div>

        {/* Card */}
        <div style={{ border: '1.5px solid #000', boxShadow: '3px 3px 0 0 #000' }}>

          {/* Tabs */}
          <div style={{ borderBottom: '1.5px solid #000' }} className="flex">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); clearState() }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  background: tab === t ? '#fff' : 'var(--surface)',
                  borderRight: t === 'login' ? '1.5px solid #000' : undefined,
                  borderBottom: tab === t ? '2px solid #fff' : undefined,
                  marginBottom: tab === t ? -1 : 0,
                  color: tab === t ? '#111' : '#888',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="p-6">
            <GoogleButton onClick={handleGoogle} loading={loading} />

            <Divider />

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#888]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#888]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#888]">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              )}

              {error && <p className={errorClass}>{error}</p>}
              {successMsg && (
                <p className="font-mono text-[11px] text-[#0055AA]">{successMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--wb-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {loading ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>

            {tab === 'login' && (
              <p className="mt-4 text-center font-mono text-[10px] text-[#aaa]">
                <a
                  href="/auth/reset-password"
                  className="hover:text-[#555] hover:underline"
                >
                  Forgot password?
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
