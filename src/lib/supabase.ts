import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session to localStorage so the user stays logged in across refreshes.
    // Note: app.modecat.net and modecat.net are different origins and do NOT share
    // localStorage — the cross-domain auth flow in auth/callback.tsx handles this.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
