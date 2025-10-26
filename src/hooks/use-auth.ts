import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase'

function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  return { user, setUser, loading, setLoading, error, setError }
}

async function getInitialSession(supabase: ReturnType<typeof createClient>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user ?? null
}

function setupAuthStateListener(
  supabase: ReturnType<typeof createClient>,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase.auth.onAuthStateChange((_event: any, session: any) => {
    setUser(session?.user ?? null)
    setLoading(false)
  })
}

function useAuthSession(
  supabase: ReturnType<typeof createClient>,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) {
  useEffect(() => {
    const initSession = async () => {
      const user = await getInitialSession(supabase)
      setUser(user)
      setLoading(false)
    }

    initSession()
    const {
      data: { subscription },
    } = setupAuthStateListener(supabase, setUser, setLoading)
    return () => subscription.unsubscribe()
  }, [supabase, setUser, setLoading])
}

export function useAuth() {
  const { user, setUser, loading, setLoading, error, setError } = useAuthState()
  const supabase = createClient()

  useAuthSession(supabase, setUser, setLoading)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return { user, loading, error, signIn }
}
