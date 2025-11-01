'use client'

import { ApplicationForm } from '@/components/forms/application-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useApplicationFormHandlers } from './use-application-form-handlers'

export default function NewApplicationPage() {
  const { applicationId, handleSave, handleSubmit } =
    useApplicationFormHandlers()

  return (
    <ProtectedRoute>
      <ApplicationForm
        applicationId={applicationId}
        onSave={handleSave}
        onSubmit={handleSubmit}
      />
    </ProtectedRoute>
  )
}
