import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Sample = Database['public']['Tables']['samples']['Row']
type SampleInsert = Database['public']['Tables']['samples']['Insert']

export async function listSamples(userId: string): Promise<Sample[]> {
  const { data, error } = await supabase
    .from('samples')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getSample(sampleId: string): Promise<Sample> {
  const { data, error } = await supabase
    .from('samples')
    .select('*')
    .eq('id', sampleId)
    .single()

  if (error) throw error
  return data
}

export async function createSample(payload: SampleInsert): Promise<Sample> {
  const { data, error } = await supabase.from('samples').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteSample(sampleId: string): Promise<void> {
  const { error } = await supabase.from('samples').delete().eq('id', sampleId)
  if (error) throw error
}

export async function uploadSampleFile(
  userId: string,
  sampleId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'wav'
  const path = `${userId}/${sampleId}.${ext}`

  const { error } = await supabase.storage
    .from('samples')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw error
  return path
}

export async function getSampleSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('samples')
    .createSignedUrl(filePath, expiresIn)

  if (error) throw error
  return data.signedUrl
}

export async function deleteSampleFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from('samples').remove([filePath])
  if (error) throw error
}
