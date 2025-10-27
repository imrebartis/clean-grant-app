'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const AuthHeader = () => (
  <div className="space-y-2 text-center">
    <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
    <p className="text-muted-foreground">
      Sign in to create your grant application
    </p>
  </div>
)

const ErrorMessage = ({ error }: { error: string }) =>
  error ? (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
      {error}
    </div>
  ) : null

const useAuthError = () => {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setError(
        'Access denied: Your email is not on the allowed list for this MVP.'
      )
    }
  }, [searchParams])

  return error
}

const handleGoogleSignIn = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

function AuthContent() {
  const error = useAuthError()

  return (
    <>
      <AuthHeader />
      <ErrorMessage error={error} />
      <button
        onClick={handleGoogleSignIn}
        className="w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign in with Google
      </button>
    </>
  )
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthContent />
        </Suspense>
      </div>
    </div>
  )
}
