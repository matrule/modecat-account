import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import type { Project } from '@/types/project'

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectDetailPage,
})

const inputClass = [
  'w-full px-3 py-2 text-[13px] bg-white',
  'border border-[#ccc]',
  'focus:outline-none focus:border-[#0055AA]',
].join(' ')

const labelClass = 'block font-mono text-[10px] uppercase tracking-wider text-[#888] mb-1'

// ─── Tag input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('')

  function addTag(value: string) {
    const tag = value.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            style={{ border: '1.5px solid #000', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', color: '#333' }}
            className="flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[#aaa] hover:text-red-500 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
          if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1])
        }}
        onBlur={() => input && addTag(input)}
        placeholder="Add tag, press Enter"
        className={inputClass}
      />
      <p className="mt-1 font-mono text-[9px] text-[#ccc]">Press Enter or comma to add</p>
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function ProjectForm({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { mutate: updateProject, isPending: isSaving } = useUpdateProject()
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject()

  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? '')
  const [bpm, setBpm] = useState(project.bpm?.toString() ?? '')
  const [tags, setTags] = useState<string[]>(project.tags)
  const [isPublic, setIsPublic] = useState(project.is_public)
  const [saved, setSaved] = useState(false)

  // Sync if project reloads
  useEffect(() => {
    setTitle(project.title)
    setDescription(project.description ?? '')
    setBpm(project.bpm?.toString() ?? '')
    setTags(project.tags)
    setIsPublic(project.is_public)
  }, [project])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateProject(
      {
        projectId: project.id,
        updates: {
          title: title.trim() || 'Untitled Project',
          description: description.trim() || null,
          bpm: bpm ? parseInt(bpm, 10) : null,
          tags,
          is_public: isPublic,
        },
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        },
      },
    )
  }

  function handleDelete() {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    deleteProject(
      { projectId: project.id, filePath: project.file_path },
      { onSuccess: () => navigate({ to: '/dashboard/projects' }) },
    )
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg">

      {/* Title */}
      <div className="mb-5">
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className={inputClass}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* BPM */}
      <div className="mb-5">
        <label className={labelClass}>BPM</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          min={1}
          max={999}
          placeholder="e.g. 140"
          className={inputClass}
          style={{ maxWidth: 120 }}
        />
      </div>

      {/* Tags */}
      <div className="mb-5">
        <label className={labelClass}>Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Visibility */}
      <div className="mb-6">
        <label className={labelClass}>Visibility</label>
        <div className="flex gap-3">
          {([false, true] as const).map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setIsPublic(val)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.06em',
                padding: '5px 14px',
                border: '1.5px solid #000',
                background: isPublic === val ? (val ? 'var(--wb-orange)' : '#222') : '#fff',
                color: isPublic === val ? (val ? '#000' : 'var(--wb-orange)') : '#888',
                cursor: 'pointer',
              }}
            >
              {val ? 'PUBLIC' : 'PRIVATE'}
            </button>
          ))}
        </div>
        {isPublic && (
          <p className="mt-2 font-mono text-[10px] text-[#aaa]">
            Anyone with the link can view this project's metadata.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          style={{
            background: saved ? '#22c55e' : 'var(--wb-blue)',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.06em',
            cursor: isSaving ? 'wait' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
        >
          {isSaving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 font-mono text-[11px] text-[#ccc] hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
          Delete project
        </button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const { data: project, isLoading, error } = useProject(projectId)

  return (
    <AuthGuard>
      <div className="p-6">
        <Link
          to="/dashboard/projects"
          className="mb-5 flex items-center gap-1.5 font-mono text-[11px] text-[#aaa] hover:text-[#111] transition-colors"
        >
          <ArrowLeft size={12} /> Back to projects
        </Link>

        {isLoading && (
          <p className="font-mono text-[12px] text-[#aaa]">Loading…</p>
        )}

        {error && (
          <p className="font-mono text-[12px] text-red-500">
            Failed to load project: {error.message}
          </p>
        )}

        {project && (
          <>
            {/* Card-style header */}
            <div
              style={{ background: 'var(--wb-blue)', borderBottom: '1.5px solid #000', border: '1.5px solid #000', boxShadow: '3px 3px 0 0 #000', padding: '8px 12px', marginBottom: 24, display: 'inline-block' }}
            >
              <span style={{ fontFamily: 'var(--font-vt323)', fontSize: 20, color: '#fff' }}>
                {project.title}
              </span>
            </div>

            <ProjectForm project={project} />
          </>
        )}
      </div>
    </AuthGuard>
  )
}
