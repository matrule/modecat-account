import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  // TODO: implement signup form (email/password + OAuth buttons)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-sm text-gray-400">Sign up — coming soon</p>
    </div>
  )
}
