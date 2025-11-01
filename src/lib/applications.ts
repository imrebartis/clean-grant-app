/**
 * Application utilities for data persistence and section management
 */

import { type ApplicationId, type GrantApplicationFormDataType } from '@/types'
import { FORM_STEPS } from '@/components/forms/form-constants'

/**
 * Save application section data
 */
export async function saveApplicationSection(
  applicationId: ApplicationId,
  sectionName: string,
  sectionData: Record<string, unknown>,
  isCompleted: boolean = false,
  completionPercentage: number = 0
) {
  const response = await fetch(`/api/applications/${applicationId}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      section_name: sectionName,
      section_data: sectionData,
      is_completed: isCompleted,
      completion_percentage: completionPercentage,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to save application section')
  }

  return response.json()
}

/**
 * Get application sections
 */
export async function getApplicationSections(applicationId: ApplicationId) {
  const response = await fetch(`/api/applications/${applicationId}/sections`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch application sections')
  }

  return response.json()
}

/**
 * Calculate completion percentage for a form step
 */
export function calculateStepCompletion(
  stepIndex: number,
  formData: GrantApplicationFormDataType
): number {
  const step = FORM_STEPS[stepIndex]
  if (!step) return 0

  const totalFields = step.fields.length
  const completedFields = step.fields.filter(field => {
    const value = formData[field as keyof GrantApplicationFormDataType]
    return value && typeof value === 'string' && value.trim() !== ''
  }).length

  return Math.round((completedFields / totalFields) * 100)
}

/**
 * Extract section data from form data for a specific step
 */
export function extractSectionData(
  stepIndex: number,
  formData: GrantApplicationFormDataType
): Record<
  string,
  GrantApplicationFormDataType[keyof GrantApplicationFormDataType]
> {
  const step = FORM_STEPS[stepIndex]
  if (!step) return {}

  const sectionData: Record<
    string,
    GrantApplicationFormDataType[keyof GrantApplicationFormDataType]
  > = {}
  step.fields.forEach(field => {
    const value = formData[field as keyof GrantApplicationFormDataType]
    if (value !== undefined) {
      sectionData[field] = value
    }
  })

  return sectionData
}

/**
 * Save current step as an application section
 */
export async function saveCurrentStepAsSection(
  applicationId: ApplicationId,
  stepIndex: number,
  formData: GrantApplicationFormDataType
) {
  const step = FORM_STEPS[stepIndex]
  if (!step || !applicationId) return

  const sectionData = extractSectionData(stepIndex, formData)
  const completionPercentage = calculateStepCompletion(stepIndex, formData)
  const isCompleted = completionPercentage === 100

  await saveApplicationSection(
    applicationId,
    step.id,
    sectionData,
    isCompleted,
    completionPercentage
  )
}
