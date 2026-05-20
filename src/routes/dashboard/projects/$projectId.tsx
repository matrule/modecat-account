import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useProject } from '@/hooks/useProjects'

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const { data: project, isLoading } = useProject(projectId)

  return (
    <AuthGuard>
      <div className="p-6">
        {isLoading && <p className="font-mono text-sm text-gray-400">Loading…</p>}
        {/* TODO: implement project metadata editor */}
        {project && <h1 className="text-lg font-medium">{project.title}</h1>}
      </div>
    </AuthGuard>
  )
}
