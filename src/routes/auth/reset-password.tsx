import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

const inputClass = [
  'w-full px-3 py-2 text-[13px]',
  'border border-[#ccc] bg-white',
  'focus:outline-none focus:border-[#0055AA]',
  'placeholder:text-[#bbb]',
].join(' ')

function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div style={{ width: '100%', maxWidth: 360 }}>

        <div className="mb-8 text-center">
          <span
            className="font-vt323 text-[28px] leading-none text-[#111]"
            style={{ fontFamily: 'var(--font-vt323)' }}
          >
            modecat_
          </span>
        </div>

        <div style={{ border: '1.5px solid #000', boxShadow: '3px 3px 0 0 #000' }}>
          <div
            style={{ borderBottom: '1.5px solid #000', padding: '10px 16px' }}
            className="font-mono text-[11px] uppercase tracking-wider text-[#888]"
          >
            Reset password
          </div>

          <div className="p-6">
            {sent ? (
              <p className="font-mono text-[12px] text-[#0055AA]">
                Check your email — we sent a reset link.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-[13px] text-[#555]">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#888]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                {error && (
                  <p className="font-mono text-[11px] text-red-500">{error}</p>
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
                  }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

            <p className="mt-4 text-center font-mono text-[10px] text-[#aaa]">
              <a href="/auth/login" className="hover:text-[#555] hover:underline">
                Back to log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
