'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/protected-route'
import type { User } from '@supabase/supabase-js'

function AccountInfo({ user }: { user: User | null }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-card-foreground">
        Account Information
      </h2>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Email
          </label>
          <p className="text-foreground">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Account Created
          </label>
          <p className="text-foreground">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : 'Unknown'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Last Sign In
          </label>
          <p className="text-foreground">
            {user?.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleDateString()
              : 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}

function AccountActions({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-card-foreground">
        Account Actions
      </h2>
      <div className="space-y-3">
        <button
          onClick={onSignOut}
          className="w-full rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function DataPrivacy() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-card-foreground">
        Data & Privacy
      </h2>
      <p className="text-sm text-muted-foreground">
        Your data is stored securely and you maintain complete ownership. You
        can export or delete your data at any time.
      </p>
      <div className="space-y-2">
        <button
          className="w-full rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          disabled
        >
          Export Data (Coming Soon)
        </button>
        <button
          className="w-full rounded-lg bg-destructive/10 px-4 py-2 text-destructive transition-colors hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          disabled
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  )
}

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary transition-colors hover:text-primary/80"
          >
            ← Back to Dashboard
          </button>
        </div>
        <AccountInfo user={user} />
        <AccountActions onSignOut={handleSignOut} />
        <DataPrivacy />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
