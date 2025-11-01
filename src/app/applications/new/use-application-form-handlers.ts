'use client'

import { useCallback, useState } from 'react'
import { useApplications } from '@/hooks/use-applications'
import { type GrantApplicationFormDataType, type ApplicationId } from '@/types'
import { useApplicationOperations } from './hooks/use-application-operations'

function useApplicationState() {
  return useState<ApplicationId | null>(null)
}

function useSaveDraft(
  createApplication: ReturnType<typeof useApplications>['createApplication'],
  updateApplication: ReturnType<typeof useApplications>['updateApplication'],
  currentApplicationId: ApplicationId | null,
  setCurrentApplicationId: (id: ApplicationId) => void
) {
  const { createNewApplication, updateExistingApplication } =
    useApplicationOperations({
      createApplication,
      updateApplication,
      currentApplicationId,
      setCurrentApplicationId,
    })

  return useCallback(
    async (formData: GrantApplicationFormDataType, currentStep?: number) => {
      try {
        let appId = currentApplicationId

        if (appId) {
          await updateExistingApplication(formData, true)
        } else {
          const newApplication = await createNewApplication(formData, true)
          appId = newApplication.id
        }

        if (typeof currentStep === 'number' && appId) {
          const { saveCurrentStepAsSection } = await import(
            '@/lib/applications'
          )
          await saveCurrentStepAsSection(appId, currentStep, formData)
        }
      } catch (error) {
        console.error('Failed to save application:', error)
        throw error
      }
    },
    [currentApplicationId, createNewApplication, updateExistingApplication]
  )
}

function useSubmitApplication(
  createApplication: ReturnType<typeof useApplications>['createApplication'],
  updateApplication: ReturnType<typeof useApplications>['updateApplication'],
  currentApplicationId: ApplicationId | null
) {
  const { createNewApplication, updateExistingApplication } =
    useApplicationOperations({
      createApplication,
      updateApplication,
      currentApplicationId,
      setCurrentApplicationId: () => {},
    })

  return useCallback(
    async (formData: GrantApplicationFormDataType) => {
      try {
        if (currentApplicationId) {
          await updateExistingApplication(formData, false)
        } else {
          await createNewApplication(formData, false)
        }
      } catch (error) {
        console.error('Failed to submit application:', error)
        throw error
      }
    },
    [currentApplicationId, createNewApplication, updateExistingApplication]
  )
}

export function useApplicationFormHandlers() {
  const { createApplication, updateApplication } = useApplications()
  const [currentApplicationId, setCurrentApplicationId] = useApplicationState()

  const handleSave = useSaveDraft(
    createApplication,
    updateApplication,
    currentApplicationId,
    setCurrentApplicationId
  )

  const handleSubmit = useSubmitApplication(
    createApplication,
    updateApplication,
    currentApplicationId
  )

  return {
    applicationId: currentApplicationId || undefined,
    handleSave,
    handleSubmit,
  }
}
