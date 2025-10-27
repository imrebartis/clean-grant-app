'use client'

import { useRouter } from 'next/navigation'

function EmptyState({
  onCreateApplication,
}: {
  onCreateApplication: () => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold text-card-foreground">
          No Applications Yet
        </h2>
        <p className="text-muted-foreground">
          Create your first grant application to get started
        </p>
        <button
          onClick={onCreateApplication}
          className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create New Application
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  const handleCreateApplication = () => {
    router.push('/applications/new')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to your dashboard
        </h1>
        <EmptyState onCreateApplication={handleCreateApplication} />
      </div>
    </div>
  )
}
