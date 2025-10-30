/**
 * Email Validation Hook
 * Custom hook for real-time email validation with debouncing
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  validateEmailMemoized,
  type EmailValidationResult,
} from '@/lib/email-validation'

interface UseEmailValidationOptions {
  debounceMs?: number
  validateOnMount?: boolean
}

interface UseEmailValidationReturn {
  validationState: EmailValidationResult
  isValidating: boolean
  validateEmail: (value: string, immediate?: boolean) => void
  clearValidation: () => void
}

const DEFAULT_DEBOUNCE_MS = 300

/**
 * Custom hook to manage email validation state and logic
 */
function useEmailValidationState(
  initialEmail: string,
  validateOnMount: boolean
) {
  const [validationState, setValidationState] = useState<EmailValidationResult>(
    () =>
      validateOnMount && initialEmail
        ? validateEmailMemoized(initialEmail)
        : { isValid: true }
  )
  const [isValidating, setIsValidating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeout = timeoutRef.current
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  return {
    validationState,
    isValidating,
    setValidationState,
    setIsValidating,
  }
}

/**
 * Creates a debounced version of a function
 */
function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): [(...args: Args) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, cancel]
}

/**
 * Custom hook for email validation with debounced validation
 */
export function useEmailValidation(
  initialEmail: string = '',
  options: UseEmailValidationOptions = {}
): UseEmailValidationReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, validateOnMount = true } = options

  const { validationState, isValidating, setValidationState, setIsValidating } =
    useEmailValidationState(initialEmail, validateOnMount)

  // Immediate validation function
  const validateImmediate = useCallback(
    (value: string) => {
      setValidationState(validateEmailMemoized(value))
      setIsValidating(false)
    },
    [setValidationState, setIsValidating]
  )

  // Debounced validation
  const [debouncedValidate, cancelDebounce] = useDebouncedCallback(
    validateImmediate,
    debounceMs
  )

  // Main validation function
  const validateEmail = useCallback(
    (value: string, immediate = false) => {
      if (immediate) {
        cancelDebounce()
        validateImmediate(value)
      } else {
        setIsValidating(true)
        debouncedValidate(value)
      }
    },
    [cancelDebounce, debouncedValidate, validateImmediate, setIsValidating]
  )

  // Clear validation state
  const clearValidation = useCallback(() => {
    cancelDebounce()
    setValidationState({ isValid: true })
    setIsValidating(false)
  }, [cancelDebounce, setValidationState, setIsValidating])

  // Handle initial validation on mount
  useEffect(() => {
    if (validateOnMount && initialEmail) {
      validateEmail(initialEmail, true)
    }
  }, [initialEmail, validateOnMount, validateEmail])

  return {
    validationState,
    isValidating,
    validateEmail,
    clearValidation,
  }
}
