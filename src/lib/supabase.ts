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
    persistSession: true,
    autoRefreshToken: true,
    // We handle the PKCE code exchange manually in /auth/callback so we can
    // control timing. Disabling auto-detection avoids the race condition where
    // Supabase starts the exchange in the background and our getSession() call
    // loses the race against it.
    detectSessionInUrl: false,
  },
})
