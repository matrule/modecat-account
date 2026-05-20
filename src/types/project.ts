/**
 * The shape of a project row as returned from Supabase.
 * Mirrors the `public.projects` table exactly.
 */
export interface Project {
  id: string
  owner_id: string
  title: string
  description: string | null
  slug: string | null
  is_public: boolean
  file_path: string
  cover_url: string | null
  bpm: number | null
  tags: string[]
  play_count: number
  block_count: number | null
  file_size_bytes: number | null
  forked_from: string | null
  schema_version: number
  created_at: string
  updated_at: string
}

/**
 * The JSON structure stored inside a project's .json file in Storage.
 * This is the tracker's internal state — expand as the tracker evolves.
 */
export interface ProjectFileSchema {
  schemaVersion: number
  title: string
  bpm: number
  // TODO: expand to match the tracker's internal state shape
  [key: string]: unknown
}
