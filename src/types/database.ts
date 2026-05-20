/**
 * Supabase-generated database types.
 *
 * This file is a handwritten placeholder that mirrors the schema in supabase/migrations/.
 * Replace it with the output of:
 *
 *   npx supabase gen types typescript \
 *     --project-id <your-project-id> \
 *     --schema public \
 *     > src/types/database.ts
 *
 * Or add a script to package.json:
 *   "db:types": "supabase gen types typescript --linked > src/types/database.ts"
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
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
          forked_from: string | null
          schema_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title?: string
          description?: string | null
          slug?: string | null
          is_public?: boolean
          file_path: string
          cover_url?: string | null
          bpm?: number | null
          tags?: string[]
          play_count?: number
          forked_from?: string | null
          schema_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          slug?: string | null
          is_public?: boolean
          file_path?: string
          cover_url?: string | null
          bpm?: number | null
          tags?: string[]
          play_count?: number
          forked_from?: string | null
          schema_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      samples: {
        Row: {
          id: string
          owner_id: string
          project_id: string | null
          name: string
          file_path: string
          file_size: number | null
          duration_ms: number | null
          mime_type: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          project_id?: string | null
          name: string
          file_path: string
          file_size?: number | null
          duration_ms?: number | null
          mime_type?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          project_id?: string | null
          name?: string
          file_path?: string
          file_size?: number | null
          duration_ms?: number | null
          mime_type?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
