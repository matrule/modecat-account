import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ProjectGrid } from '@/components/project/ProjectGrid'
import { useAuth } from '@/hooks/useAuth'
import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/project'

const TRACKER_URL = 'https://app.modecat.net'

export const Route = createFileRoute('/dashboard/projects/')({
  component: ProjectsPage,
})

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--border-radius-md)',
        padding: '11px 14px',
        border: '1px solid var(--border)',
      }}
    >
      <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 500, color: '#111', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

// ─── Skeleton cards for loading state ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{ border: '1.5px solid #e8e8e8', boxShadow: '3px 3px 0 0 #e8e8e8' }}
      className="animate-pulse"
    >
      <div style={{ background: '#e8e8e8', height: 38 }} />
      <div className="px-3 py-3">
        <div style={{ background: '#f0f0f0', height: 12, width: '40%', marginBottom: 8 }} />
        <div style={{ background: '#f0f0f0', height: 12, width: '60%' }} />
      </div>
      <div style={{ background: 'var(--surface)', borderTop: '1.5px solid #e8e8e8', height: 36 }} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: projects, isLoading, error } = useProjects(user?.id)
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject()

  // Derived stats
  const total = projects?.length ?? 0
  const publicCount = projects?.filter((p) => p.is_public).length ?? 0
  const totalPlays = projects?.reduce((sum, p) => sum + (p.play_count ?? 0), 0) ?? 0

  async function handleOpen(project: Project) {
    // Get the current session tokens and open the tracker in a new tab.
    // The tracker's cloud.init() picks up mc_token + mc_refresh to establish the session,
    // and mc_project to know which project to load automatically.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate({ to: '/auth/login' })
      return
    }
    const url = new URL(TRACKER_URL)
    url.searchParams.set('mc_token', session.access_token)
    url.searchParams.set('mc_refresh', session.refresh_token)
    url.searchParams.set('mc_project', project.id)
    window.open(url.toString(), '_blank', 'noopener')
  }

  function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    deleteProject({ projectId: project.id, filePath: project.file_path })
  }

  return (
    <AuthGuard>
      <div className="p-6">

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-3 gap-3" style={{ maxWidth: 480 }}>
          <StatCard label="Total projects" value={isLoading ? '—' : total} />
          <StatCard label="Public" value={isLoading ? '—' : publicCount} />
          <StatCard label="Total plays" value={isLoading ? '—' : totalPlays} />
        </div>

        {/* Error state */}
        {error && (
          <p className="mb-4 font-mono text-[12px] text-red-500">
            Failed to load projects: {error.message}
          </p>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && projects && (
          <ProjectGrid
            projects={projects}
            onOpen={handleOpen}
            onDelete={isDeleting ? undefined : handleDelete}
          />
        )}
      </div>
    </AuthGuard>
  )
}
