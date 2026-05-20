import { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Camera } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { getProfile, updateProfile, uploadAvatar, isUsernameTaken } from '@/lib/api/profiles'
import type { Database } from '@/types/database'

export const Route = createFileRoute('/dashboard/settings/')({
  component: ProfileSettingsPage,
})

type Profile = Database['public']['Tables']['profiles']['Row']

const inputClass = [
  'w-full px-3 py-2 text-[13px] bg-white',
  'border border-[#ccc]',
  'focus:outline-none focus:border-[#0055AA]',
].join(' ')

const labelClass = 'block font-mono text-[10px] uppercase tracking-wider text-[#888] mb-1'

function ProfileSettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then((p) => {
      setProfile(p)
      setDisplayName(p.display_name ?? '')
      setUsername(p.username ?? '')
      setBio(p.bio ?? '')
      setAvatarUrl(p.avatar_url)
      setLoading(false)
    })
  }, [user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile(user.id, { avatar_url: url })
      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSaving(true)

    const trimmedUsername = username.trim().toLowerCase()
    if (trimmedUsername && !/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(trimmedUsername)) {
      setError('Username must be 3–32 chars, lowercase letters, numbers and hyphens only.')
      setSaving(false)
      return
    }

    if (trimmedUsername && trimmedUsername !== profile?.username) {
      const taken = await isUsernameTaken(trimmedUsername)
      if (taken) {
        setError('That username is already taken.')
        setSaving(false)
        return
      }
    }

    try {
      await updateProfile(user.id, {
        display_name: displayName.trim() || null,
        username: trimmedUsername || null,
        bio: bio.trim() || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = (displayName || user?.email || '??').slice(0, 2).toUpperCase()

  return (
    <AuthGuard>
      <div className="p-6">
        <h2 className="mb-6 text-[15px] font-medium text-[#111]">Profile</h2>

        {loading ? (
          <p className="font-mono text-[12px] text-[#aaa]">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="max-w-lg">

            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div
                  style={{ width: 64, height: 64, background: avatarUrl ? 'transparent' : 'var(--wb-blue)', borderRadius: '50%', overflow: 'hidden' }}
                  className="flex items-center justify-center"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-[18px] font-medium text-white">{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{ background: '#fff', border: '1.5px solid #000', borderRadius: '50%', width: 22, height: 22, position: 'absolute', bottom: 0, right: 0 }}
                  className="flex items-center justify-center hover:bg-[#f5f5f5]"
                  title="Change avatar"
                >
                  {uploadingAvatar ? (
                    <span className="font-mono text-[8px]">…</span>
                  ) : (
                    <Camera size={10} />
                  )}
                </button>
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#111]">{displayName || user?.email}</p>
                <p className="font-mono text-[11px] text-[#aaa]">{user?.email}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Display name */}
            <div className="mb-4">
              <label className={labelClass}>Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className={labelClass}>Username</label>
              <div className="flex items-center">
                <span style={{ background: 'var(--surface)', border: '1px solid #ccc', borderRight: 'none', padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>
                  modecat.net/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  maxLength={32}
                  placeholder="yourhandle"
                  className={inputClass}
                  style={{ borderLeft: 'none' }}
                />
              </div>
              <p className="mt-1 font-mono text-[9px] text-[#ccc]">3–32 chars, letters, numbers and hyphens</p>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="A few words about you or your music…"
                className={inputClass}
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && <p className="mb-3 font-mono text-[11px] text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              style={{
                background: saved ? '#22c55e' : 'var(--wb-blue)',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save profile'}
            </button>
          </form>
        )}
      </div>
    </AuthGuard>
  )
}
