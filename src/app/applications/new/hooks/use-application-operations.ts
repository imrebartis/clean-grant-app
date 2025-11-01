import { useCallback } from 'react'
import {
  type ApplicationId,
  type GrantApplication,
  type GrantApplicationFormDataType,
} from '@/types'
import { normalizeFormData, getApplicationTitle } from '../utils/form-data'

type ApplicationOperations = {
  createApplication: (data: {
    title: string
    form_data?: GrantApplicationFormDataType
  }) => Promise<GrantApplication>
  updateApplication: (
    id: ApplicationId,
    data: Partial<GrantApplication>
  ) => Promise<GrantApplication>
}

export function useApplicationOperations({
  createApplication,
  updateApplication,
  currentApplicationId,
  setCurrentApplicationId,
}: ApplicationOperations & {
  currentApplicationId: ApplicationId | null
  setCurrentApplicationId: (id: ApplicationId) => void
}) {
  const createNewApplication = useCallback(
    async (formData: GrantApplicationFormDataType, isDraft = false) => {
      const normalizedData = {
        title: getApplicationTitle(formData, isDraft),
        form_data: normalizeFormData(formData),
      }

      const newApplication = await createApplication(normalizedData)

      if (isDraft && newApplication?.id) {
        setCurrentApplicationId(newApplication.id)
      }

      return newApplication
    },
    [createApplication, setCurrentApplicationId]
  )

  const updateExistingApplication = useCallback(
    async (formData: GrantApplicationFormDataType, isDraft = false) => {
      if (!currentApplicationId) return

      const updateData = {
        title: getApplicationTitle(formData, isDraft),
        form_data: normalizeFormData(formData),
        status: isDraft ? ('draft' as const) : ('submitted' as const),
      }

      return updateApplication(currentApplicationId, updateData)
    },
    [updateApplication, currentApplicationId]
  )

  return {
    createNewApplication,
    updateExistingApplication,
  }
}
