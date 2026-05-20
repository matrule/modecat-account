import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/projects/new')({
  component: NewProjectPage,
})

function NewProjectPage() {
  // TODO: implement new project form / wizard
  return (
    <AuthGuard>
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">New project — coming soon</p>
      </div>
    </AuthGuard>
  )
}
