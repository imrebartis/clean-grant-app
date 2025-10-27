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

export interface GrantApplication {
  id: ApplicationId
  user_id: UserId
  company_name: string
  founder_name: string
  founder_email: string

  // Voice recording questions (8 required)
  business_description: string // "Describe your business in 2 minutes"
  environmental_problem: string // "What environmental problem are you solving?"
  business_model: string // "What's your business model - how do you make money?"
  key_achievements: string // "What are your key achievements in the last 12 months?"
  funding_use: string // "What would you use this grant funding for specifically?"
  future_goals: string // "What are your goals for the next 2 years?"
  competitors: string // "Who are your main competitors or alternatives?"
  unique_positioning: string // "Why is your company uniquely positioned to succeed?"

  // File upload
  financial_statements_url?: string // PDF file URL

  status: 'draft' | 'submitted' | 'processing' | 'completed'
  makecom_submission_id?: SubmissionId
  created_at: string
  updated_at: string
}

export interface VoiceRecording {
  id: VoiceRecordingId
  application_id: ApplicationId
  field_name:
    | 'business_description'
    | 'environmental_problem'
    | 'business_model'
    | 'key_achievements'
    | 'funding_use'
    | 'future_goals'
    | 'competitors'
    | 'unique_positioning'
  audio_url: string
  transcription: string
  duration: number
  file_format: 'mp3' | 'm4a' | 'wav'
  created_at: string
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
