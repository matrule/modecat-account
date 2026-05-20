import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/dashboard/projects/')({
  component: ProjectsPage,
})

function ProjectsPage() {
  return (
    <AuthGuard>
      {/* TODO: render stat cards + ProjectGrid */}
      <div className="p-6">
        <p className="font-mono text-sm text-gray-400">Projects — coming soon</p>
      </div>
    </AuthGuard>
  )
}
