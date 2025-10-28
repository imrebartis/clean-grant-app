import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  type GrantApplicationFormDataType,
  validateGrantApplicationFormData,
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
  onSave?: (data: GrantApplicationFormDataType) => Promise<void>
  onSubmit?: (data: GrantApplicationFormDataType) => Promise<void>
  router: ReturnType<typeof useRouter>
}

export function useFormHandlers(props: UseFormHandlersProps) {
  const autoSave = useAutoSave(props)
  const handleFieldChange = useFieldChange(props)
  const validateCurrentStep = useStepValidation(props)
  const handleNext = useNextStep(props, validateCurrentStep)
  const handlePrevious = usePreviousStep(props)
  const handleSubmit = useFormSubmit(props)

  return {
    autoSave,
    handleFieldChange,
    validateCurrentStep,
    handleNext,
    handlePrevious,
    handleSubmit,
  }
}

function useAutoSave({
  formData,
  onSave,
  isSaving,
  setIsSaving,
  setLastSaved,
}: Pick<
  UseFormHandlersProps,
  'formData' | 'onSave' | 'isSaving' | 'setIsSaving' | 'setLastSaved'
>) {
  return useCallback(async () => {
    if (!onSave || isSaving) return

    try {
      setIsSaving(true)
      await onSave(formData)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, onSave, isSaving, setIsSaving, setLastSaved])
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
      }
    })

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }, [currentStep, formData, setErrors])
}

function useNextStep(
  { setCurrentStep }: Pick<UseFormHandlersProps, 'setCurrentStep'>,
  validateCurrentStep: () => boolean
) {
  return useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1))
    }
  }, [validateCurrentStep, setCurrentStep])
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
      const validatedData = validateGrantApplicationFormData(formData)
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
