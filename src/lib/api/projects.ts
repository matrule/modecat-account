import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/project'

// ─── Database queries ────────────────────────────────────────────────────────

export async function listProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function getProject(projectId: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data as Project
}

export async function createProject(
  payload: Pick<Project, 'owner_id' | 'file_path'> & Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'owner_id' | 'created_at'>>,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw error
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

/**
 * Upload (or replace) a project JSON blob to Storage.
 * Returns the storage path for persisting in the projects table.
 */
export async function uploadProjectFile(
  userId: string,
  projectId: string,
  blob: Blob,
): Promise<string> {
  const path = `${userId}/${projectId}.json`
  const { error } = await supabase.storage
    .from('projects')
    .upload(path, blob, { upsert: true, contentType: 'application/json' })

  if (error) throw error
  return path
}

/**
 * Download a project's JSON blob from Storage.
 * Parse with JSON.parse(await blob.text()).
 */
export async function downloadProjectFile(filePath: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from('projects').download(filePath)
  if (error) throw error
  return data
}

/**
 * Get a short-lived signed URL for a project file (default 1 hour).
 * Use this to pass the URL to the tracker's cloud.ts module.
 */
export async function getProjectSignedUrl(
  filePath: string,
  expiresIn = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('projects')
    .createSignedUrl(filePath, expiresIn)

  if (error) throw error
  return data.signedUrl
}

/**
 * Delete a project's file from Storage.
 * Call this after deleting the DB row.
 */
export async function deleteProjectFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from('projects').remove([filePath])
  if (error) throw error
}
