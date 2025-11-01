import { type UrlValidationResult } from '@/lib/url-validation'

interface ValidationFeedbackProps {
  isValidating: boolean
  validationState: UrlValidationResult
  error?: string
}

// Sub-components
export function LoadingState() {
  return (
    <div className="flex items-center gap-1 text-sm text-blue-600">
      <span aria-hidden="true" className="animate-pulse">
        ⏳
      </span>
      <span className="sr-only">Validating URL</span>
      Checking URL...
    </div>
  )
}

export function ErrorState({
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

export function SuccessState() {
  return (
    <div className="flex items-center gap-1 text-sm text-green-600">
      <span aria-hidden="true">✓</span>
      <span aria-label="URL format is valid">Valid URL</span>
    </div>
  )
}

export function ValidationFeedback({
  isValidating,
  validationState,
  error,
}: ValidationFeedbackProps) {
  if (isValidating) return <LoadingState />
  if (!validationState.isValid && validationState.error) {
    return (
      <ErrorState
        message={validationState.error}
        ariaLabel={validationState.ariaLabel}
      />
    )
  }
  if (validationState.isValid) return <SuccessState />
  if (error) return <ErrorState message={error} />
  return null
}
