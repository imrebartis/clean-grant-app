import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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

export function FormField({
  field,
  value,
  onChange,
  error,
  question,
}: FormFieldProps) {
  const fieldLabel = formatFieldLabel(field)
  const { isTextArea, isFileUpload, inputType } = getFieldType(field, question)

  return (
    <div className="space-y-2">
      <FormFieldLabel
        field={field}
        fieldLabel={fieldLabel}
        question={question}
      />

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

      <FormFieldError error={error} />
    </div>
  )
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

// Component for field input
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

function FormFieldInput({
  field,
  value,
  onChange,
  error,
  question,
  fieldLabel,
  isTextArea,
  isFileUpload,
  inputType,
}: FormFieldInputProps) {
  if (isFileUpload) {
    return (
      <FileUploadField
        field={field}
        value={value}
        onChange={onChange}
        error={error}
      />
    )
  }

  if (isTextArea) {
    return (
      <TextAreaField
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        question={question}
      />
    )
  }

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

// Component for field error
function FormFieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <p className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )
}

interface FileUploadFieldProps {
  field: string
  value: string
  onChange: (value: string) => void
  error?: string
}

function FileUploadField({
  field,
  value,
  onChange,
  error,
}: FileUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Input
        id={field}
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter PDF URL or upload file"
        className={cn(error && 'border-destructive')}
      />
      <p className="text-xs text-muted-foreground">
        Upload your financial statements as a PDF file
      </p>
    </div>
  )
}

interface TextAreaFieldProps {
  field: string
  value: string
  onChange: (value: string) => void
  error?: string
  question?: string
}

function TextAreaField({
  field,
  value,
  onChange,
  error,
  question,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <textarea
        id={field}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Answer: ${question}`}
        rows={4}
        className={cn(
          'resize-vertical flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive'
        )}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          You can type your answer or use voice recording (coming soon)
        </p>
        <span className="text-xs text-muted-foreground">
          {value.length} characters
        </span>
      </div>
    </div>
  )
}
