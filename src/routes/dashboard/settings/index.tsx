import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsProfilePage,
})

function SettingsProfilePage() {
  // TODO: implement profile settings (display name, username, avatar, bio)
  return (
    <AuthGuard>
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">Profile settings — coming soon</p>
      </div>
    </AuthGuard>
  )
}
