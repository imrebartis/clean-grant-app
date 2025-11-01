import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useUrlValidation } from '@/hooks/use-url-validation'
import { ValidationFeedback } from './validation-feedback'
import { type UrlValidationResult } from '@/lib/url-validation'

interface UrlValidationInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  className?: string
  required?: boolean
}

export function UrlValidationInput(props: UrlValidationInputProps) {
  const {
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    className,
    required = false,
  } = props
  const { isValidating, validationState, handleBlur, hasError } =
    useUrlValidation(value)

  const handleBlurWrapper = (e: React.FocusEvent<HTMLInputElement>) => {
    handleBlur(e.target.value)
    onBlur?.()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <UrlLabel id={id} label={label} required={required} />
      <UrlInput
        id={id}
        value={value}
        onChange={onChange}
        onBlur={handleBlurWrapper}
        hasError={!!hasError || !!error}
        required={required}
      />
      <UrlValidationFeedback
        isValidating={isValidating}
        validationState={validationState}
        error={error}
      />
      <UrlHelpText id={id} />
    </div>
  )
}

function UrlLabel({
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

function UrlInput({
  id,
  value,
  onChange,
  onBlur,
  hasError,
  required,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  hasError: boolean
  required: boolean
}) {
  return (
    <Input
      id={id}
      type="url"
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder="https://example.com"
      className={cn(
        hasError && 'border-destructive focus-visible:ring-destructive'
      )}
      required={required}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={`${id}-help`}
    />
  )
}

function UrlValidationFeedback({
  isValidating,
  validationState,
  error,
}: {
  isValidating: boolean
  validationState: UrlValidationResult
  error?: string
}) {
  return (
    <div className="h-5">
      <ValidationFeedback
        isValidating={isValidating}
        validationState={validationState}
        error={error}
      />
    </div>
  )
}

function UrlHelpText({ id }: { id: string }) {
  return (
    <div id={`${id}-help`} className="sr-only">
      Enter a valid URL including http:// or https://
    </div>
  )
}
