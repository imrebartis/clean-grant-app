'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type GrantApplicationFormDataType } from '@/lib/validation'
import { ApplicationId } from '@/types'
import { useFormHandlers } from './use-form-handlers'
import { FORM_STEPS } from './form-constants'
import { FormHeader } from './form-header'
import { FormContent } from './form-content'
import { FormNavigationButtons } from './form-navigation-buttons'

interface ApplicationFormProps {
  applicationId?: ApplicationId
  initialData?: GrantApplicationFormDataType
  onSave?: (
    data: GrantApplicationFormDataType,
    currentStep?: number
  ) => Promise<void>
  onSubmit?: (data: GrantApplicationFormDataType) => Promise<void>
}

export function ApplicationForm(props: ApplicationFormProps) {
  const formState = useFormState(props.initialData)
  const formHandlers = useFormHandlers({
    ...formState,
    onSave: props.onSave,
    onSubmit: props.onSubmit,
    router: useRouter(),
  })

  const currentStepConfig = FORM_STEPS[formState.currentStep]
  const progress = ((formState.currentStep + 1) / FORM_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <FormHeader
          applicationId={props.applicationId}
          currentStep={formState.currentStep}
          progress={progress}
          lastSaved={formState.lastSaved}
          isSaving={formState.isSaving}
        />

        <FormContent
          currentStepConfig={currentStepConfig}
          formData={formState.formData}
          errors={formState.errors}
          onFieldChange={formHandlers.handleFieldChange}
        />

        <FormNavigationButtons
          currentStep={formState.currentStep}
          formData={formState.formData}
          isLoading={formState.isLoading}
          isSaving={formState.isSaving}
          onPrevious={formHandlers.handlePrevious}
          onNext={formHandlers.handleNext}
          onSubmit={formHandlers.handleSubmit}
        />
      </div>
    </div>
  )
}

function useFormState(initialData?: GrantApplicationFormDataType) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<GrantApplicationFormDataType>(
    initialData || {
      company_name: '',
      founder_name: '',
      founder_email: '',
      website_url: '',
      business_description: '',
      environmental_problem: '',
      business_model: '',
      key_achievements: '',
      funding_use: '',
      future_goals: '',
      competitors: '',
      unique_positioning: '',
      financial_statements_url: undefined,
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
  }
}
