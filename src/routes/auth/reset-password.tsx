import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  // TODO: implement reset-password form
  // Supabase sends users here with a token in the URL hash; use supabase.auth.updateUser()
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-sm text-gray-400">Reset password — coming soon</p>
    </div>
  )
}
