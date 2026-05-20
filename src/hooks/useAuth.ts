import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  /** True while the initial session is being loaded from storage. */
  loading: boolean
}

/**
 * Subscribe to the current Supabase auth session.
 * Returns user, session, and a loading flag.
 *
 * Use this in any component that needs to know who's logged in.
 * For route-level auth gating, use AuthGuard instead.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    // Grab the current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    // Subscribe to auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }))
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
