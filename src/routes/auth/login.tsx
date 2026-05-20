import { createFileRoute } from '@tanstack/react-router'

interface LoginSearch {
  redirect_to?: string
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect_to: typeof search.redirect_to === 'string' ? search.redirect_to : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  // TODO: implement login form (email/password + magic link + OAuth buttons)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-sm text-gray-400">Login — coming soon</p>
    </div>
  )
}
