// Branded types for type safety (Claude Guide: C-5)
export type Brand<T, K> = T & { __brand: K }

export type UserId = Brand<string, 'UserId'>
export type ApplicationId = Brand<string, 'ApplicationId'>
export type VoiceRecordingId = Brand<string, 'VoiceRecordingId'>
export type SubmissionId = Brand<string, 'SubmissionId'>

// Core Application Types
export interface UserProfile {
  id: UserId
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

// Updated to match database schema
export interface GrantApplication {
  id: ApplicationId
  user_id: UserId | null
  title: string
  status: 'draft' | 'submitted' | 'processing' | 'completed' | null
  form_data: GrantApplicationFormData | null // All form fields stored in JSON
  make_webhook_id: string | null
  make_status: string | null
  created_at: string | null
  updated_at: string | null
  makecom_submission_id: SubmissionId | null
}

// Form data structure that goes into the form_data JSONB field
export interface GrantApplicationFormData {
  // Basic info
  company_name?: string
  founder_name?: string
  founder_email?: string

  // Voice recording questions (8 required)
  business_description?: string // "Describe your business in 2 minutes"
  environmental_problem?: string // "What environmental problem are you solving?"
  business_model?: string // "What's your business model - how do you make money?"
  key_achievements?: string // "What are your key achievements in the last 12 months?"
  funding_use?: string // "What would you use this grant funding for specifically?"
  future_goals?: string // "What are your goals for the next 2 years?"
  competitors?: string // "Who are your main competitors or alternatives?"
  unique_positioning?: string // "Why is your company uniquely positioned to succeed?"

  // File upload
  financial_statements_url?: string // PDF file URL

  // Additional fields can be added without schema changes
  [key: string]: unknown
}

// Updated VoiceRecording interface to match actual database schema
export interface VoiceRecording {
  id: VoiceRecordingId
  application_id: ApplicationId
  question_id: string // varchar(100) - identifies which question this recording is for
  file_path: string // varchar(500) - path to the audio file
  duration: number // integer - duration in seconds
  attempt_number: number | null // integer - which attempt this is (default 1)
  transcripts: Record<string, unknown> | null // jsonb - array of transcription attempts
  selected_transcript: string | null // text - the chosen transcription
  confidence_score: number | null // decimal(3,2) - transcription confidence
  needs_review: boolean | null // boolean - whether this needs human review
  created_at: string | null // timestamp with time zone
}

// Updated ApplicationSection interface to match actual database schema
export interface ApplicationSection {
  id: string
  application_id: ApplicationId | null
  section_name: string
  section_data: Record<string, unknown> | null // JSONB field, not 'content'
  is_completed: boolean | null
  completion_percentage: number | null
  updated_at: string | null
  // Note: no created_at field in actual schema
}

export interface MakecomSubmission {
  id: SubmissionId
  application_id: ApplicationId
  webhook_url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  google_doc_url?: string
  response_data?: Record<string, unknown>
  error_message?: string
  submitted_at: string
  completed_at?: string
}

// Webhook payload format (matching existing Make.com scenario)
export interface MakecomWebhookPayload {
  eventId: string
  eventType: 'form.response_finished'
  createdAt: string
  data: {
    responseId: string
    submissionId: string
    respondentId: string
    formId: string
    formName: string
    createdAt: string
    fields: Array<{
      key: string
      label: string
      type: 'INPUT_TEXT' | 'FILE_UPLOAD'
      value: string | { url: string }
    }>
  }
}

// API Error Response Format
export interface ApiError {
  message: string
  field?: string // For validation errors
  ariaLabel?: string // For screen readers
}

// Theme Colors Interface
export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  secondary: string
  accent: string
  muted: string
  border: string
}

// Re-export validation schemas and types
export {
  grantApplicationFormDataSchema,
  grantApplicationCompleteFormSchema,
  grantApplicationInsertSchema,
  grantApplicationUpdateSchema,
  applicationSectionSchema,
  voiceRecordingSchema,
  validateGrantApplicationFormData,
  validateGrantApplicationCompleteForm,
  validateGrantApplicationInsert,
  validateGrantApplicationUpdate,
  validateApplicationSection,
  validateVoiceRecording,
  type GrantApplicationFormDataType,
  type GrantApplicationCompleteForm,
  type GrantApplicationInsertData,
  type GrantApplicationUpdateData,
  type ApplicationSectionData,
  type VoiceRecordingData,
  type ApplicationStatus,
  type VoiceRecordingField,
  type AudioFileFormat,
} from '@/lib/validation'
