'use client'

import { useCallback } from 'react'
import { ApplicationForm } from '@/components/forms/application-form'
import { useApplications } from '@/hooks/use-applications'
import { type GrantApplicationFormDataType } from '@/types'

export default function NewApplicationPage() {
  const { createApplication } = useApplications()

  const handleSave = useCallback(
    async (formData: GrantApplicationFormDataType) => {
      // Auto-save functionality - create or update draft
      try {
        await createApplication({
          title: formData.company_name || 'Untitled Application',
          form_data: formData,
        })
      } catch (error) {
        console.error('Failed to save application:', error)
        throw error
      }
    },
    [createApplication]
  )

  const handleSubmit = useCallback(
    async (formData: GrantApplicationFormDataType) => {
      // Final submission
      try {
        await createApplication({
          title: formData.company_name || 'Grant Application',
          form_data: formData,
        })
      } catch (error) {
        console.error('Failed to submit application:', error)
        throw error
      }
    },
    [createApplication]
  )

  return <ApplicationForm onSave={handleSave} onSubmit={handleSubmit} />
}
