import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/project'

interface ProjectGridProps {
  projects: Project[]
  onOpen?: (project: Project) => void
}

export function ProjectGrid({ projects, onOpen }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#aaa' }}>
          No projects yet. Create your first one!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onOpen={onOpen} />
      ))}
    </div>
  )
}
