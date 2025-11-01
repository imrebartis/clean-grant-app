import { useState, useEffect } from 'react'
import { useDebounce } from './use-debounce'
import {
  validateUrl,
  validateUrlOnBlur,
  type UrlValidationResult,
} from '@/lib/url-validation'

export function useUrlValidation(initialValue: string) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationState, setValidationState] = useState<UrlValidationResult>({
    isValid: false,
  })
  const debouncedValue = useDebounce(initialValue, 500)

  // Validate on change with debounce
  useEffect(() => {
    if (!debouncedValue) {
      setValidationState({ isValid: false, error: 'URL is required' })
      return
    }

    setIsValidating(true)
    const timer = setTimeout(() => {
      const result = validateUrl(debouncedValue)
      setValidationState(result)
      setIsValidating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [debouncedValue])

  // Validate on blur
  const handleBlur = (value: string) => {
    if (value) {
      setValidationState(validateUrlOnBlur(value))
    }
  }

  return {
    isValidating,
    validationState,
    handleBlur,
    hasError: (!validationState.isValid && validationState.error) || false,
  }
}
