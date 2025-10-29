import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { EmailValidationInput } from './email-validation-input'
import { FileUpload } from './file-upload'

interface FormFieldProps {
  field: string
  value: string
  onChange: (value: string) => void
  error?: string
  question?: string
}

// Helper function to format field labels
function formatFieldLabel(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to determine field type
function getFieldType(field: string, question?: string) {
  return {
    isTextArea: question !== undefined,
    isFileUpload: field === 'financial_statements_url',
    inputType: field.includes('email') ? 'email' : 'text',
  }
}

// Component for field label
function FormFieldLabel({
  field,
  fieldLabel,
  question,
}: {
  field: string
  fieldLabel: string
  question?: string
}) {
  return (
    <Label htmlFor={field} className="text-sm font-medium">
      {fieldLabel}
      {question && (
        <span className="mt-1 block text-xs font-normal text-muted-foreground">
          {question}
        </span>
      )}
    </Label>
  )
}

// Component for field error
function FormFieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <p className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )
}

// Character count and feedback component for textarea
function TextAreaFeedback({
  value,
  isShort,
  isGoodLength,
}: {
  value: string
  isShort: boolean
  isGoodLength: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Voice recording will be available in task 3.3
        </p>
        {isShort && value.length > 0 && (
          <span className="text-xs text-amber-600">
            Consider adding more detail
          </span>
        )}
        {isGoodLength && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span aria-hidden="true">✓</span>
            Good detail level
          </span>
        )}
      </div>
      <span
        className={cn(
          'text-xs',
          isShort && value.length > 0
            ? 'text-amber-600'
            : isGoodLength
              ? 'text-green-600'
              : 'text-muted-foreground'
        )}
      >
        {value.length} characters
      </span>
    </div>
  )
}

// Textarea field component
function TextAreaField({
  field,
  value,
  onChange,
  error,
  question,
}: {
  field: string
  value: string
  onChange: (value: string) => void
  error?: string
  question?: string
}) {
  const minLength = 50
  const recommendedLength = 200
  const isShort = value.length < minLength
  const isGoodLength = value.length >= recommendedLength

  return (
    <div className="space-y-2">
      <textarea
        id={field}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Answer: ${question}`}
        rows={6}
        className={cn(
          'resize-vertical flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          isGoodLength && 'border-green-500 focus:border-green-500'
        )}
      />
      <TextAreaFeedback
        value={value}
        isShort={isShort}
        isGoodLength={isGoodLength}
      />
    </div>
  )
}

// File upload field component
function FileUploadField({
  field,
  fieldLabel,
  value,
  onChange,
  error,
}: {
  field: string
  fieldLabel: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <FileUpload
      id={field}
      label={fieldLabel}
      value={value}
      onChange={onChange}
      error={error}
      accept=".pdf"
      maxSize={10}
      description="Upload your financial statements as a PDF file (max 10MB)"
    />
  )
}

// Email field component
function EmailField({
  field,
  fieldLabel,
  value,
  onChange,
  error,
}: {
  field: string
  fieldLabel: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <EmailValidationInput
      id={field}
      label={fieldLabel}
      value={value}
      onChange={onChange}
      error={error}
      required={true}
    />
  )
}

// Regular input field component
function RegularInputField({
  field,
  fieldLabel,
  value,
  onChange,
  error,
  inputType,
}: {
  field: string
  fieldLabel: string
  value: string
  onChange: (value: string) => void
  error?: string
  inputType: string
}) {
  return (
    <Input
      id={field}
      type={inputType}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
      className={cn(error && 'border-destructive')}
    />
  )
}

// Props interface for form field input
interface FormFieldInputProps {
  field: string
  value: string
  onChange: (value: string) => void
  error?: string
  question?: string
  fieldLabel: string
  isTextArea: boolean
  isFileUpload: boolean
  inputType: string
}

// Component for rendering file upload field
function renderFileUploadField(props: FormFieldInputProps) {
  return (
    <FileUploadField
      field={props.field}
      fieldLabel={props.fieldLabel}
      value={props.value}
      onChange={props.onChange}
      error={props.error}
    />
  )
}

// Component for rendering text area field
function renderTextAreaField(props: FormFieldInputProps) {
  return (
    <TextAreaField
      field={props.field}
      value={props.value}
      onChange={props.onChange}
      error={props.error}
      question={props.question}
    />
  )
}

// Component for rendering email field
function renderEmailField(props: FormFieldInputProps) {
  return (
    <EmailField
      field={props.field}
      fieldLabel={props.fieldLabel}
      value={props.value}
      onChange={props.onChange}
      error={props.error}
    />
  )
}

// Component for rendering regular input field
function renderRegularInputField(props: FormFieldInputProps) {
  return (
    <RegularInputField
      field={props.field}
      fieldLabel={props.fieldLabel}
      value={props.value}
      onChange={props.onChange}
      error={props.error}
      inputType={props.inputType}
    />
  )
}

// Main form field input component
function FormFieldInput(props: FormFieldInputProps) {
  const { isTextArea, isFileUpload, inputType } = props

  if (isFileUpload) return renderFileUploadField(props)
  if (isTextArea) return renderTextAreaField(props)
  if (inputType === 'email') return renderEmailField(props)

  return renderRegularInputField(props)
}

export function FormField({
  field,
  value,
  onChange,
  error,
  question,
}: FormFieldProps) {
  const fieldLabel = formatFieldLabel(field)
  const { isTextArea, isFileUpload, inputType } = getFieldType(field, question)
  const isEmailField = inputType === 'email'

  return (
    <div className="space-y-2">
      {/* Don't show label for email fields or file uploads as they handle their own labels */}
      {!isEmailField && !isFileUpload && (
        <FormFieldLabel
          field={field}
          fieldLabel={fieldLabel}
          question={question}
        />
      )}

      <FormFieldInput
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        question={question}
        fieldLabel={fieldLabel}
        isTextArea={isTextArea}
        isFileUpload={isFileUpload}
        inputType={inputType}
      />

      {/* Don't show error for email fields or file uploads as they handle their own errors */}
      {!isEmailField && !isFileUpload && <FormFieldError error={error} />}
    </div>
  )
}
