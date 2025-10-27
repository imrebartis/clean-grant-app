'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

const AuthHeader = () => (
  <div className="space-y-2 text-center">
    <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
    <p className="text-muted-foreground">
      Sign in to create your grant application
    </p>
  </div>
)

const ErrorMessage = ({ error }: { error: string }) => {
  if (!error) return null

  const isAccessDenied = error.includes('Access denied')

  return (
    <div
      className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive"
      role="alert"
      aria-live="polite"
    >
      <p>{error}</p>
      {isAccessDenied && (
        <div className="space-y-2 text-sm">
          <p className="font-medium">What can you do?</p>
          <ul className="list-inside list-disc space-y-1 text-destructive/80">
            <li>Check if you&apos;re using the correct email address</li>
            <li>Contact the administrator to request access</li>
            <li>
              Try again with a different email if you have multiple accounts
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

const SigningOutView = () => (
  <div className="space-y-6">
    <AuthHeader />
    <div className="text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="mt-2 text-muted-foreground">Signing you out...</p>
    </div>
  </div>
)

const useSignOutEffect = (
  shouldSignOut: boolean,
  setIsSigningOut: (value: boolean) => void,
  setShouldSignOut: (value: boolean) => void,
  setError: (error: string) => void
) => {
  useEffect(() => {
    if (!shouldSignOut) return

    const signOutUser = async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        await supabase.auth.signOut()
        console.log('Sign out completed') // Debug log

        // After sign out, show error message
        setIsSigningOut(false)
        setShouldSignOut(false)
        setError(
          'Access denied: Your email is not on the allowed list for this MVP. Please contact support if you believe this is an error.'
        )
      } catch (signOutError) {
        console.error('Error signing out:', signOutError)
        setIsSigningOut(false)
        setShouldSignOut(false)
        setError('Authentication failed. Please try again.')
      }
    }

    signOutUser()
  }, [shouldSignOut, setIsSigningOut, setShouldSignOut, setError])
}

function AuthContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [shouldSignOut, setShouldSignOut] = useState(false)

  useSignOutEffect(shouldSignOut, setIsSigningOut, setShouldSignOut, setError)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    console.log('Error param:', errorParam) // Debug log

    if (errorParam === 'access_denied') {
      console.log('Access denied detected') // Debug log
      setIsSigningOut(true)
      setShouldSignOut(true)
    } else if (errorParam) {
      setError('Authentication failed. Please try again.')
    }
  }, [searchParams])

  if (isSigningOut) {
    return <SigningOutView />
  }

  return (
    <div className="space-y-6">
      <AuthHeader />
      <ErrorMessage error={error} />
      <OAuthButtons onError={setError} />
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="space-y-2 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          }
        >
          <AuthContent />
        </Suspense>
      </div>
    </div>
  )
}
