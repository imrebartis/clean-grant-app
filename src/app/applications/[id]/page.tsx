'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ApplicationForm } from '@/components/forms/application-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useApplications } from '@/hooks/use-applications'
import {
  type GrantApplication,
  type GrantApplicationFormDataType,
  type ApplicationId,
} from '@/types'
import React from 'react'

export default function EditApplicationPage() {
  const params = useParams()
  const applicationId = params.id as ApplicationId

  const state = useApplicationState(applicationId)
  const handlers = useApplicationHandlers(applicationId, state)

  if (state.isLoading) {
    return <LoadingState />
  }

  if (state.error) {
    return <ErrorState error={state.error} />
  }

  if (!state.application) {
    return <NotFoundState />
  }

  // Default form data with required fields
  const defaultFormData = {
    company_name: '',
    founder_name: '',
    founder_email: '',
    website_url: '',
  }

  return (
    <ProtectedRoute>
      <ApplicationForm
        applicationId={applicationId}
        initialData={state.application?.form_data || defaultFormData}
        onSave={handlers.handleSave}
        onSubmit={handlers.handleSubmit}
      />
    </ProtectedRoute>
  )
}

function useApplicationState(applicationId: ApplicationId) {
  const { getApplication } = useApplications()
  const [application, setApplication] = useState<GrantApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadApplication = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const app = await getApplication(applicationId)
      setApplication(app)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load application'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, getApplication])

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId, loadApplication])

  return { application, setApplication, isLoading, error }
}

function useApplicationHandlers(
  applicationId: ApplicationId,
  state: {
    application: GrantApplication | null
    setApplication: React.Dispatch<
      React.SetStateAction<GrantApplication | null>
    >
  }
) {
  const { updateApplication } = useApplications()

  const handleSave = useCallback(
    async (formData: GrantApplicationFormDataType) => {
      if (!applicationId) return

      try {
        const updatedApp = await updateApplication(applicationId, {
          form_data: formData,
          title:
            formData.company_name ||
            state.application?.title ||
            'Untitled Application',
        })
        state.setApplication(updatedApp)
      } catch (error) {
        console.error('Failed to save application:', error)
        throw error
      }
    },
    [applicationId, updateApplication, state]
  )

  const handleSubmit = useCallback(
    async (formData: GrantApplicationFormDataType) => {
      if (!applicationId) return

      try {
        await updateApplication(applicationId, {
          form_data: formData,
          title:
            formData.company_name ||
            state.application?.title ||
            'Grant Application',
          status: 'submitted',
        })
      } catch (error) {
        console.error('Failed to submit application:', error)
        throw error
      }
    },
    [applicationId, updateApplication, state.application?.title]
  )

  return { handleSave, handleSubmit }
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted"></div>
          <div className="h-4 w-1/2 rounded bg-muted"></div>
          <div className="h-64 rounded bg-muted"></div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Application Not Found
          </h1>
          <p className="text-muted-foreground">
            The requested application could not be found.
          </p>
        </div>
      </div>
    </div>
  )
}
