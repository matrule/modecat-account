import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { useCreateProject } from '@/hooks/useProjects'

export const Route = createFileRoute('/dashboard/projects/new')({
  component: NewProjectPage,
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

// ─── Page ─────────────────────────────────────────────────────────────────────
function NewProjectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { mutate: createProject, isPending, error } = useCreateProject()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bpm, setBpm] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const projectId = crypto.randomUUID()
    const emptyBlob = new Blob([JSON.stringify({})], { type: 'application/json' })

    createProject(
      {
        userId: user.id,
        projectId,
        blob: emptyBlob,
        meta: {
          id: projectId,
          owner_id: user.id,
          title: title.trim() || 'Untitled Project',
          description: description.trim() || null,
          bpm: bpm ? parseInt(bpm, 10) : null,
          tags,
          is_public: isPublic,
          schema_version: 1,
        },
      },
      {
        onSuccess: (project) => {
          navigate({ to: '/dashboard/projects/$projectId', params: { projectId: project.id } })
        },
      },
    )
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <Link
          to="/dashboard/projects"
          className="mb-5 flex items-center gap-1.5 font-mono text-[11px] text-[#aaa] hover:text-[#111] transition-colors"
        >
          <ArrowLeft size={12} /> Back to projects
        </Link>

        <h2 className="mb-6 text-[15px] font-medium text-[#111]">New project</h2>

        <form onSubmit={handleSubmit} className="max-w-lg">

          {/* Title */}
          <div className="mb-5">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Untitled Project"
              className={inputClass}
              autoFocus
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
              placeholder="What's this track about?"
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

          {error && (
            <p className="mb-3 font-mono text-[11px] text-red-500">
              {error instanceof Error ? error.message : 'Failed to create project'}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              background: 'var(--wb-blue)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              cursor: isPending ? 'wait' : 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </div>
    </AuthGuard>
  )
}
