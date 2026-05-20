import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/settings/account')({
  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  // TODO: implement account settings (email change, password, danger zone / delete account)
  return (
    <AuthGuard>
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">Account settings — coming soon</p>
      </div>
    </AuthGuard>
  )
}
