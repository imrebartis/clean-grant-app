import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  accept?: string
  maxSize?: number
  description?: string
}

// File upload handlers hook
function useFileUploadHandlers(
  maxSize: number,
  accept: string,
  onChange: (value: string) => void,
  setUploadError: (error: string) => void,
  setIsUploading: (loading: boolean) => void,
  fileInputRef: React.RefObject<HTMLInputElement>
) {
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (accept && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a PDF file')
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploadError('')
    setIsUploading(true)

    try {
      const mockUrl = `https://storage.supabase.co/v1/object/public/financial-docs/${Date.now()}-${file.name}`
      await new Promise(resolve => setTimeout(resolve, 1000))
      onChange(mockUrl)
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setUploadError('')
    onChange(url)
  }

  const handleRemoveFile = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return { handleFileSelect, handleUrlChange, handleRemoveFile }
}

// File display component
function FileDisplay({
  value,
  onRemove,
  getFileName,
}: {
  value: string
  onRemove: () => void
  getFileName: (url: string) => string
}) {
  if (!value) return null

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate text-sm text-muted-foreground">
        {getFileName(value)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 flex-shrink-0 p-0"
      >
        ×
      </Button>
    </div>
  )
}

// Upload button component
function UploadButton({
  fileInputRef,
  isUploading,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>
  isUploading: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => fileInputRef.current?.click()}
      disabled={isUploading}
      className="flex-shrink-0"
    >
      {isUploading ? 'Uploading...' : 'Choose File'}
    </Button>
  )
}

// URL input component
function UrlInput({
  id,
  value,
  onChange,
  error,
}: {
  id: string
  value: string
  onChange: (url: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-url`} className="text-xs text-muted-foreground">
        Or enter a URL to your PDF:
      </Label>
      <Input
        id={`${id}-url`}
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://example.com/financial-statements.pdf"
        className={cn(error && 'border-destructive')}
      />
    </div>
  )
}

// Status messages component
function StatusMessages({
  error,
  uploadError,
  value,
}: {
  error?: string
  uploadError: string
  value: string
}) {
  if (error || uploadError) {
    return (
      <div className="flex items-center gap-1 text-sm text-destructive">
        <span aria-hidden="true">⚠</span>
        {error || uploadError}
      </div>
    )
  }

  if (value) {
    return (
      <div className="flex items-center gap-1 text-sm text-green-600">
        <span aria-hidden="true">✓</span>
        File ready for submission
      </div>
    )
  }

  return null
}

// Helper function to get filename from URL
function getFileName(url: string): string {
  try {
    return url.split('/').pop() || 'Uploaded file'
  } catch {
    return 'Uploaded file'
  }
}

// Props interface for file upload section
interface FileUploadSectionProps {
  id: string
  value: string
  isUploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: () => void
  onUrlChange: (url: string) => void
  error?: string
  accept: string
}

// File upload input section component
function FileUploadSection(props: FileUploadSectionProps) {
  const {
    id,
    value,
    isUploading,
    fileInputRef,
    onFileSelect,
    onRemoveFile,
    onUrlChange,
    error,
    accept,
  } = props

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-file`} // Add -file suffix to match test expectations
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          accept={accept}
          className="hidden"
          data-testid={`${id}-file`} // Add test ID for better test targeting
        />
        <UploadButton fileInputRef={fileInputRef} isUploading={isUploading} />
        <FileDisplay
          value={value}
          onRemove={onRemoveFile}
          getFileName={getFileName}
        />
      </div>
      <UrlInput id={id} value={value} onChange={onUrlChange} error={error} />
    </div>
  )
}

// Main file upload component
export function FileUpload({
  id,
  label,
  value,
  onChange,
  error,
  accept = '.pdf',
  maxSize = 10,
  description = 'Upload your financial statements as a PDF file (max 10MB)',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { handleFileSelect, handleUrlChange, handleRemoveFile } =
    useFileUploadHandlers(
      maxSize,
      accept,
      onChange,
      setUploadError,
      setIsUploading,
      fileInputRef
    )

  return (
    <div className="space-y-3">
      <Label htmlFor={`${id}-file`} className="text-sm font-medium">
        {label}
      </Label>
      <FileUploadSection
        id={id}
        value={value}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
        onUrlChange={handleUrlChange}
        error={error}
        accept={accept}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
      <StatusMessages error={error} uploadError={uploadError} value={value} />
    </div>
  )
}
