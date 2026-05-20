import { ExternalLink } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onOpen?: (project: Project) => void
}

/**
 * Workbench-style project card.
 *
 * Anatomy (from spec):
 *   ┌─────────────────────────────────────────────┐  ← border: 1.5px solid #000
 *   │ bg:#0055AA  [VT323 title]           [BADGE] │  ← card header
 *   ├─────────────────────────────────────────────┤
 *   │  140 BPM                                    │
 *   │  [techno]  [bass]                           │  ← tags + BPM
 *   ├─────────────────────────────────────────────┤
 *   │  bg:#fafafa  2 hours ago      [Open ↗]      │  ← footer
 *   └─────────────────────────────────────────────┘
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <article
      style={{
        border: '1.5px solid #000',
        boxShadow: '3px 3px 0 0 #000',
        borderRadius: 0,
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
          className="font-vt323 text-[18px] leading-none text-white"
          style={{ fontFamily: 'var(--font-vt323)' }}
        >
          {project.title}
        </span>

        {/* Privacy badge */}
        {project.is_public ? (
          <span
            style={{
              background: 'var(--wb-orange)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.06em',
              padding: '2px 5px',
            }}
          >
            PUBLIC
          </span>
        ) : (
          <span
            style={{
              background: '#222',
              color: 'var(--wb-orange)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.06em',
              padding: '2px 5px',
            }}
          >
            PRIVATE
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-3 py-2.5">
        {/* BPM */}
        {project.bpm != null && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#444' }} className="mb-2">
            {project.bpm} BPM
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  border: '1.5px solid #000',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '1px 6px',
                  color: '#333',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          background: 'var(--surface)',
          borderTop: '1.5px solid #000',
          padding: '6px 10px',
        }}
        className="flex items-center justify-between"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
          {timeAgo(project.updated_at)}
        </span>

        <button onClick={() => onOpen?.(project)} className="btn-bevel flex items-center gap-1">
          Open <ExternalLink size={9} />
        </button>
      </div>
    </article>
  )
}
