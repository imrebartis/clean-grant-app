'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type GrantApplication } from '@/types'

interface ApplicationListProps {
  applications: GrantApplication[]
  onCreateNew: () => void
  isLoading?: boolean
}

export function ApplicationList({
  applications,
  onCreateNew,
  isLoading = false,
}: ApplicationListProps) {
  const router = useRouter()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (applications.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />
  }

  return (
    <div className="space-y-4">
      <ApplicationListHeader onCreateNew={onCreateNew} />
      <ApplicationGrid applications={applications} router={router} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-1/3 rounded bg-muted"></div>
            <div className="h-4 w-1/2 rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full rounded bg-muted"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold text-card-foreground">
            No Applications Yet
          </h2>
          <p className="text-muted-foreground">
            Create your first grant application to get started
          </p>
          <Button onClick={onCreateNew}>Create New Application</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ApplicationListHeader({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Your Applications</h2>
      <Button onClick={onCreateNew}>Create New Application</Button>
    </div>
  )
}

interface ApplicationGridProps {
  applications: GrantApplication[]
  router: ReturnType<typeof useRouter>
}

function ApplicationGrid({ applications, router }: ApplicationGridProps) {
  return (
    <div className="space-y-4">
      {applications.map((application: GrantApplication) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onEdit={() => router.push(`/applications/${application.id}`)}
        />
      ))}
    </div>
  )
}

interface ApplicationCardProps {
  application: GrantApplication
  onEdit: () => void
}

function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
  const statusColor = getStatusColor(application.status)
  const completionPercentage = getCompletionPercentage(application)
  const lastUpdated = application.updated_at
    ? new Date(application.updated_at).toLocaleDateString()
    : 'Never'

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onEdit}
    >
      <CardHeader>
        <ApplicationCardHeader
          title={application.title}
          status={application.status}
          statusColor={statusColor}
          completionPercentage={completionPercentage}
          onEdit={onEdit}
        />
      </CardHeader>

      <CardContent>
        <ApplicationCardContent
          application={application}
          completionPercentage={completionPercentage}
          lastUpdated={lastUpdated}
        />
      </CardContent>
    </Card>
  )
}

interface ApplicationCardHeaderProps {
  title: string
  status: string | null
  statusColor: string
  completionPercentage: number
  onEdit: (e: React.MouseEvent) => void
}

function ApplicationCardHeader({
  title,
  status,
  statusColor,
  completionPercentage,
  onEdit,
}: ApplicationCardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <CardTitle className="text-lg">
          {title || 'Untitled Application'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
          >
            {status || 'draft'}
          </span>
          <span className="text-sm text-muted-foreground">
            {completionPercentage}% complete
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={e => {
          e.stopPropagation()
          onEdit({} as React.MouseEvent)
        }}
      >
        Edit
      </Button>
    </div>
  )
}

interface ApplicationCardContentProps {
  application: GrantApplication
  completionPercentage: number
  lastUpdated: string
}

function ApplicationCardContent({
  application,
  completionPercentage,
  lastUpdated,
}: ApplicationCardContentProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Company:</span>
          <p className="font-medium">
            {application.form_data?.company_name || 'Not specified'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Last updated:</span>
          <p className="font-medium">{lastUpdated}</p>
        </div>
      </div>

      {application.form_data?.business_description && (
        <div>
          <span className="text-sm text-muted-foreground">
            Business description:
          </span>
          <p className="mt-1 line-clamp-2 text-sm">
            {application.form_data.business_description}
          </p>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: string | null) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'submitted':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'processing':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

function getCompletionPercentage(application: GrantApplication) {
  if (!application.form_data) return 0

  const requiredFields = [
    'company_name',
    'founder_name',
    'founder_email',
    'business_description',
    'environmental_problem',
    'business_model',
    'key_achievements',
    'funding_use',
    'future_goals',
    'competitors',
    'unique_positioning',
  ]

  const completedFields = requiredFields.filter(field => {
    const value =
      application.form_data?.[field as keyof typeof application.form_data]
    return value && String(value).trim() !== ''
  })

  return Math.round((completedFields.length / requiredFields.length) * 100)
}
