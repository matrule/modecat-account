import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { LogOut, Trash2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/dashboard/settings/account')({
  component: AccountSettingsPage,
})

const inputClass = [
  'w-full px-3 py-2 text-[13px] bg-white',
  'border border-[#ccc]',
  'focus:outline-none focus:border-[#0055AA]',
].join(' ')

const labelClass = 'block font-mono text-[10px] uppercase tracking-wider text-[#888] mb-1'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 max-w-lg">
      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-[#aaa]">{title}</h3>
      {children}
    </div>
  )
}

function AccountSettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Password change ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  // ── Sign out ──
  const [signingOut, setSigningOut] = useState(false)

  // ── Delete account ──
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordSaving(true)
    try {
      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      })
      if (signInError) throw new Error('Current password is incorrect.')

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 2000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    navigate({ to: '/auth/login' })
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'delete my account') return
    setDeleting(true)
    setDeleteError(null)
    try {
      // Delete the user via Supabase admin — requires the user to be signed in.
      // The profiles row cascades automatically due to ON DELETE CASCADE.
      const { error } = await supabase.rpc('delete_own_account')
      if (error) throw error
      await supabase.auth.signOut()
      navigate({ to: '/auth/login' })
    } catch (err) {
      // If the RPC doesn't exist yet, fall back to a helpful message
      setDeleteError(
        'Account deletion requires a server-side function. ' +
        'Contact support at hello@modecat.net to delete your account.',
      )
      setDeleting(false)
    }
  }

  const isOAuthUser = !user?.email || user?.app_metadata?.provider !== 'email'

  return (
    <AuthGuard>
      <div className="p-6">
        <h2 className="mb-1 text-[15px] font-medium text-[#111]">Account</h2>
        <p className="mb-6 font-mono text-[11px] text-[#aaa]">{user?.email}</p>

        {/* Settings nav tabs */}
        <div className="mb-6 flex gap-4 border-b border-[#e8e8e8]">
          <Link
            to="/dashboard/settings"
            className="pb-2 font-mono text-[11px] text-[#aaa] hover:text-[#111]"
          >
            Profile
          </Link>
          <span className="pb-2 font-mono text-[11px] text-[#111] border-b-2 border-[#0055AA]">
            Account
          </span>
        </div>

        {/* Change password — only for email users */}
        {!isOAuthUser && (
          <Section title="Change password">
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              {passwordError && (
                <p className="font-mono text-[11px] text-red-500">{passwordError}</p>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                style={{
                  background: passwordSaved ? '#22c55e' : 'var(--wb-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: passwordSaving ? 'wait' : 'pointer',
                  opacity: passwordSaving ? 0.7 : 1,
                  transition: 'background 0.2s',
                  alignSelf: 'flex-start',
                }}
              >
                {passwordSaving ? 'Saving…' : passwordSaved ? 'Updated ✓' : 'Update password'}
              </button>
            </form>
          </Section>
        )}

        {isOAuthUser && (
          <Section title="Password">
            <p className="font-mono text-[12px] text-[#aaa]">
              You signed in with Google. Password management is handled by your Google account.
            </p>
          </Section>
        )}

        {/* Sign out */}
        <Section title="Session">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ border: '1.5px solid #000', padding: '7px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', background: '#fff', cursor: 'pointer' }}
            className="flex items-center gap-2 hover:bg-[#f5f5f5] transition-colors"
          >
            <LogOut size={12} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone">
          <div
            style={{ border: '1.5px solid #fca5a5', padding: 16 }}
          >
            <p className="mb-3 text-[13px] text-[#555]">
              Permanently delete your account and all projects. This cannot be undone.
            </p>
            <p className="mb-2 font-mono text-[10px] text-[#aaa]">
              Type <strong>delete my account</strong> to confirm
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete my account"
              className={inputClass}
              style={{ marginBottom: 12, borderColor: '#fca5a5' }}
            />

            {deleteError && (
              <p className="mb-2 font-mono text-[11px] text-red-500">{deleteError}</p>
            )}

            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'delete my account' || deleting}
              style={{
                background: deleteConfirm === 'delete my account' ? '#ef4444' : '#f5f5f5',
                color: deleteConfirm === 'delete my account' ? '#fff' : '#ccc',
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                cursor: deleteConfirm === 'delete my account' ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
              className="flex items-center gap-2"
            >
              <Trash2 size={12} />
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </Section>
      </div>
    </AuthGuard>
  )
}
