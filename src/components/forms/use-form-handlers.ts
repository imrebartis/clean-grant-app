import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  type GrantApplicationFormDataType,
  validateGrantApplicationCompleteForm,
} from '@/lib/validation'
import { FORM_STEPS } from './form-constants'

interface UseFormHandlersProps {
  formData: GrantApplicationFormDataType
  setFormData: React.Dispatch<
    React.SetStateAction<GrantApplicationFormDataType>
  >
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setLastSaved: React.Dispatch<React.SetStateAction<Date | null>>
  onSave?: (
    data: GrantApplicationFormDataType,
    currentStep?: number
  ) => Promise<void>
  onSubmit?: (data: GrantApplicationFormDataType) => Promise<void>
  router: ReturnType<typeof useRouter>
}

export function useFormHandlers(props: UseFormHandlersProps) {
  const handleFieldChange = useFieldChange(props)
  const validateCurrentStep = useStepValidation(props)
  const handleNext = useNextStep(
    {
      setCurrentStep: props.setCurrentStep,
      onSave: props.onSave,
      formData: props.formData,
      setIsSaving: props.setIsSaving,
      setLastSaved: props.setLastSaved,
      currentStep: props.currentStep,
    },
    validateCurrentStep
  )
  const handlePrevious = usePreviousStep(props)
  const handleSubmit = useFormSubmit(props)

  return {
    handleFieldChange,
    validateCurrentStep,
    handleNext,
    handlePrevious,
    handleSubmit,
  }
}

function useFieldChange({
  setFormData,
  errors,
  setErrors,
}: Pick<UseFormHandlersProps, 'setFormData' | 'errors' | 'setErrors'>) {
  return useCallback(
    (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))

      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [setFormData, errors, setErrors]
  )
}

function useStepValidation({
  currentStep,
  formData,
  setErrors,
}: Pick<UseFormHandlersProps, 'currentStep' | 'formData' | 'setErrors'>) {
  return useCallback(() => {
    const currentStepConfig = FORM_STEPS[currentStep]
    const stepErrors: Record<string, string> = {}

    currentStepConfig.fields.forEach(field => {
      const value = formData[field as keyof GrantApplicationFormDataType]

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        stepErrors[field] = `${field.replace('_', ' ')} is required`
      } else if (field === 'founder_email') {
        // Additional email format validation
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        if (!emailRegex.test(value as string)) {
          stepErrors[field] = 'Please enter a valid email address'
        }
      }
    })

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }, [currentStep, formData, setErrors])
}

function useNextStep(
  {
    setCurrentStep,
    onSave,
    formData,
    setIsSaving,
    setLastSaved,
    currentStep,
  }: Pick<
    UseFormHandlersProps,
    | 'setCurrentStep'
    | 'onSave'
    | 'formData'
    | 'setIsSaving'
    | 'setLastSaved'
    | 'currentStep'
  >,
  validateCurrentStep: () => boolean
) {
  // Type for the onSave function that can handle both signatures
  type OnSaveFunction =
    | ((data: GrantApplicationFormDataType) => Promise<void>)
    | ((data: GrantApplicationFormDataType, step?: number) => Promise<void>)

  // Handle saving progress
  const handleSave = useCallback(async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      // Pass current step to save function for section-based saving
      if (onSave.length > 1) {
        await (onSave as OnSaveFunction)(formData, currentStep)
      } else {
        await (onSave as (data: GrantApplicationFormDataType) => Promise<void>)(
          formData
        )
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      // Don't prevent navigation on save failure, just log it
    } finally {
      setIsSaving(false)
    }
  }, [onSave, formData, currentStep, setIsSaving, setLastSaved])

  return useCallback(async () => {
    if (!validateCurrentStep()) return

    await handleSave()
    setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1))
  }, [validateCurrentStep, setCurrentStep, handleSave])
}

function usePreviousStep({
  setCurrentStep,
}: Pick<UseFormHandlersProps, 'setCurrentStep'>) {
  return useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [setCurrentStep])
}

function useFormSubmit({
  onSubmit,
  setIsLoading,
  formData,
  router,
  setErrors,
}: Pick<
  UseFormHandlersProps,
  'onSubmit' | 'setIsLoading' | 'formData' | 'router' | 'setErrors'
>) {
  return useCallback(async () => {
    if (!onSubmit) return

    try {
      setIsLoading(true)
      const validatedData = validateGrantApplicationCompleteForm(formData)
      await onSubmit(validatedData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Form submission failed:', error)
      if (error instanceof Error) {
        setErrors({ general: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }, [onSubmit, setIsLoading, formData, router, setErrors])
}
