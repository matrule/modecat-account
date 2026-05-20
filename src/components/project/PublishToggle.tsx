import { useUpdateProject } from '@/hooks/useProjects'
import type { Project } from '@/types/project'

interface PublishToggleProps {
  project: Project
}

/**
 * Toggle a project between public and private.
 * Post-MVP — renders as a placeholder for now.
 */
export function PublishToggle({ project }: PublishToggleProps) {
  const { mutate: updateProject, isPending } = useUpdateProject()

  function toggle() {
    updateProject({ projectId: project.id, updates: { is_public: !project.is_public } })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      style={{
        background: project.is_public ? 'var(--wb-orange)' : '#222',
        color: project.is_public ? '#000' : 'var(--wb-orange)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.06em',
        padding: '3px 8px',
        border: 'none',
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {project.is_public ? 'PUBLIC' : 'PRIVATE'}
    </button>
  )
}
