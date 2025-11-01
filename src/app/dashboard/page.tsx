'use client'

import { useRouter } from 'next/navigation'
import { ApplicationList } from '@/components/applications/application-list'
import { useApplications } from '@/hooks/use-applications'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { applications, isLoading, error } = useApplications()

  const handleCreateApplication = () => {
    router.push('/applications/new')
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Grant Application Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={handleProfileClick}
              aria-label="Go to profile"
            >
              Profile
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Error loading applications: {error}
              </p>
            </div>
          )}

          <ApplicationList
            applications={applications}
            onCreateNew={handleCreateApplication}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
