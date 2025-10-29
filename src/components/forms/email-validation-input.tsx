import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface EmailValidationResult {
  isValid: boolean
  error?: string
  ariaLabel?: string
}

interface EmailValidationInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  className?: string
  required?: boolean
}

// RFC 5322 compliant email validation
function validateEmail(email: string): EmailValidationResult {
  // Empty field handling
  if (!email.trim()) {
    return { isValid: false }
  }

  // RFC 5322 regex pattern
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., founder@company.com)',
      ariaLabel: 'Invalid email format. Please enter a valid email address.',
    }
  }

  return { isValid: true }
}

// Custom hook for email validation with debouncing
function useEmailValidation(email: string, debounceMs: number = 300) {
  const [validationState, setValidationState] = useState<EmailValidationResult>(
    () => {
      // Initialize with validation of the current email value
      return email ? validateEmail(email) : { isValid: true }
    }
  )
  const [isValidating, setIsValidating] = useState(false)

  const validateEmailDebounced = useCallback(
    (value: string, immediate: boolean = false) => {
      if (immediate) {
        const result = validateEmail(value)
        setValidationState(result)
        setIsValidating(false)
        return
      }

      setIsValidating(true)
      const timeoutId = setTimeout(() => {
        const result = validateEmail(value)
        setValidationState(result)
        setIsValidating(false)
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    },
    [debounceMs]
  )

  return {
    validationState,
    isValidating,
    validateEmail: validateEmailDebounced,
  }
}

// Validation feedback component
function ValidationFeedback({
  id,
  hasValidationError,
  showSuccess,
  validationState,
  error,
}: {
  id: string
  hasValidationError: boolean
  showSuccess: boolean
  validationState: EmailValidationResult
  error?: string
}) {
  return (
    <div id={`${id}-validation`} role="status" aria-live="polite">
      {hasValidationError && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <span aria-hidden="true">⚠</span>
          {validationState.error}
        </div>
      )}
      {showSuccess && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <span aria-hidden="true">✓</span>
          Valid email address
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}
    </div>
  )
}

// Email input handlers
function useEmailInputHandlers(
  onChange: (value: string) => void,
  onBlur: (() => void) | undefined,
  validateEmailFn: (value: string, immediate?: boolean) => void
) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    validateEmailFn(newValue)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateEmailFn(e.target.value, true)
    onBlur?.()
  }

  return { handleChange, handleBlur }
}

export function EmailValidationInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  className,
  required = false,
}: EmailValidationInputProps) {
  const { validationState, validateEmail: validateEmailFn } =
    useEmailValidation(value)
  const { handleChange, handleBlur } = useEmailInputHandlers(
    onChange,
    onBlur,
    validateEmailFn
  )

  const hasValidationError = !validationState.isValid && !!value
  const showSuccess = validationState.isValid && !!value

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Input
        id={id}
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your email address"
        aria-invalid={hasValidationError || !!error}
        aria-describedby={`${id}-validation`}
        className={cn(
          className,
          hasValidationError && 'border-destructive focus:border-destructive',
          showSuccess && 'border-green-500 focus:border-green-500'
        )}
      />

      <ValidationFeedback
        id={id}
        hasValidationError={hasValidationError}
        showSuccess={showSuccess}
        validationState={validationState}
        error={error}
      />
    </div>
  )
}

// Export validation function for use in form navigation
export { validateEmail }
