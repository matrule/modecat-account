import { ExternalLink, Trash2 } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onOpen?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  return (
    <article
      style={{
        border: '1.5px solid #000',
        boxShadow: '3px 3px 0 0 #000',
        background: '#fff',
      }}
    >
      {/* ── Header (blue bar) ── */}
      <div
        style={{
          background: 'var(--wb-blue)',
          borderBottom: '1.5px solid #000',
          padding: '7px 10px',
        }}
        className="flex items-center justify-between gap-2"
      >
        <span
          style={{ fontFamily: 'var(--font-vt323)', fontSize: 18, lineHeight: 1, color: '#fff', flex: 1, minWidth: 0 }}
          className="truncate"
        >
          {project.title}
        </span>

        {project.is_public ? (
          <span style={{ background: 'var(--wb-orange)', color: '#000', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '2px 5px', flexShrink: 0 }}>
            PUBLIC
          </span>
        ) : (
          <span style={{ background: '#222', color: 'var(--wb-orange)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '2px 5px', flexShrink: 0 }}>
            PRIVATE
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-3 py-2.5" style={{ minHeight: 56 }}>
        {project.bpm != null && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#444', marginBottom: 6 }}>
            {project.bpm} BPM
          </p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{ border: '1.5px solid #000', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 6px', color: '#333' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.bpm == null && project.tags.length === 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ccc' }}>No metadata</p>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{ background: 'var(--surface)', borderTop: '1.5px solid #000', padding: '6px 10px' }}
        className="flex items-center justify-between gap-2"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
          {timeAgo(project.updated_at)}
        </span>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(project)}
              title="Delete project"
              className="flex items-center justify-center text-[#ccc] hover:text-red-500 transition-colors"
              style={{ padding: 2 }}
            >
              <Trash2 size={12} />
            </button>
          )}

          {onOpen && (
            <button onClick={() => onOpen(project)} className="btn-bevel flex items-center gap-1">
              Open <ExternalLink size={9} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
