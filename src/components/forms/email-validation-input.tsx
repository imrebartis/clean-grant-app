import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useEmailValidation } from '@/hooks/use-email-validation'
import {
  validateEmail,
  type EmailValidationResult,
} from '@/lib/email-validation'

// Types
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

interface ValidationFeedbackProps {
  id: string
  hasValidationError: boolean
  showSuccess: boolean
  isValidating: boolean
  validationState: EmailValidationResult
  error?: string
}

// Sub-components
function LoadingState() {
  return (
    <div className="flex items-center gap-1 text-sm text-blue-600">
      <span aria-hidden="true" className="animate-pulse">
        ⏳
      </span>
      <span className="sr-only">Validating email format</span>
      Checking email format...
    </div>
  )
}

function ErrorState({
  message,
  ariaLabel,
}: {
  message: string
  ariaLabel?: string
}) {
  return (
    <div className="flex items-center gap-1 text-sm text-destructive">
      <span aria-hidden="true">⚠</span>
      <span aria-label={ariaLabel}>{message}</span>
    </div>
  )
}

function SuccessState() {
  return (
    <div className="flex items-center gap-1 text-sm text-green-600">
      <span aria-hidden="true">✓</span>
      <span aria-label="Email format is valid">Valid email address</span>
    </div>
  )
}

function ValidationFeedback({
  hasValidationError,
  showSuccess,
  isValidating,
  validationState,
  error,
}: ValidationFeedbackProps) {
  if (isValidating) return <LoadingState />
  if (hasValidationError)
    return (
      <ErrorState
        message={validationState.error || 'Invalid email'}
        ariaLabel={validationState.ariaLabel}
      />
    )
  if (showSuccess) return <SuccessState />
  if (error) return <ErrorState message={error} />
  return null
}

// Hook for input handlers
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

// Email Input Component
function EmailInput({
  id,
  value,
  onChange,
  onBlur,
  hasError,
  showSuccess,
  isValidating,
  error,
  className,
  required,
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  hasError: boolean
  showSuccess: boolean
  isValidating: boolean
  error?: string
  className?: string
  required: boolean
}) {
  return (
    <Input
      id={id}
      type="email"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder="Enter your email address"
      aria-invalid={hasError || !!error}
      aria-describedby={`${id}-validation ${id}-help`}
      aria-required={required}
      className={cn(
        className,
        hasError && 'border-destructive focus:border-destructive',
        showSuccess && 'border-green-500 focus:border-green-500',
        isValidating && 'border-blue-300 focus:border-blue-300'
      )}
    />
  )
}

// Label Component
function EmailLabel({
  id,
  label,
  required,
}: {
  id: string
  label: string
  required: boolean
}) {
  return (
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && (
        <span className="ml-1 text-destructive" aria-label="required">
          *
        </span>
      )}
    </Label>
  )
}

// Help Text Component
function HelpText({ id }: { id: string }) {
  return (
    <div id={`${id}-help`} className="sr-only">
      Email format: example@domain.com
    </div>
  )
}

// Validation state hooks
function useEmailValidationState(value: string) {
  const {
    validationState,
    validateEmail: validateEmailFn,
    isValidating,
  } = useEmailValidation(value, { debounceMs: 300, validateOnMount: true })

  return {
    validationState,
    validateEmail: validateEmailFn,
    isValidating,
    hasValidationError: !validationState.isValid && !!value,
    showSuccess: validationState.isValid && !!value && !isValidating,
  }
}

// Main component
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
  const {
    validationState,
    validateEmail: validateEmailFn,
    isValidating,
    hasValidationError,
    showSuccess,
  } = useEmailValidationState(value)

  const { handleChange, handleBlur } = useEmailInputHandlers(
    onChange,
    onBlur,
    validateEmailFn
  )

  return (
    <div className="space-y-2">
      <EmailLabel id={id} label={label} required={required} />
      <EmailInput
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        hasError={hasValidationError}
        showSuccess={showSuccess}
        isValidating={isValidating}
        error={error}
        className={className}
        required={required}
      />
      <ValidationFeedbackContainer
        id={id}
        hasValidationError={hasValidationError}
        showSuccess={showSuccess}
        isValidating={isValidating}
        validationState={validationState}
        error={error}
      />
      <HelpText id={id} />
    </div>
  )
}

// Validation feedback container component
function ValidationFeedbackContainer({
  id,
  hasValidationError,
  showSuccess,
  isValidating,
  validationState,
  error,
}: ValidationFeedbackProps) {
  return (
    <div
      id={`${id}-validation`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <ValidationFeedback
        id={id}
        hasValidationError={hasValidationError}
        showSuccess={showSuccess}
        isValidating={isValidating}
        validationState={validationState}
        error={error}
      />
    </div>
  )
}

// Export validation function for use in form navigation
export { validateEmail }
