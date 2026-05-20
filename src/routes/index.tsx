import { createFileRoute, redirect } from '@tanstack/react-router'

// "/" redirects to the projects dashboard
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard/projects' })
  },
})
