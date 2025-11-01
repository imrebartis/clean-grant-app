/**
 * Grant Application Validation Schemas
 * Updated to match actual database schema with JSONB form_data structure
 */

import { z } from 'zod'

// Application status enum (matches database enum)
const applicationStatusSchema = z.enum([
  'draft',
  'submitted',
  'processing',
  'completed',
  'failed',
])

// Voice recording field names enum
const voiceRecordingFieldSchema = z.enum([
  'business_description',
  'environmental_problem',
  'business_model',
  'key_achievements',
  'funding_use',
  'future_goals',
  'competitors',
  'unique_positioning',
])

// File format enum for voice recordings
const audioFileFormatSchema = z.enum(['mp3', 'm4a', 'wav'])

// Form data schema - this goes into the form_data JSONB field
export const grantApplicationFormDataSchema = z
  .object({
    // Basic info
    company_name: z
      .string()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters'),
    founder_name: z
      .string()
      .min(1, 'Founder name is required')
      .max(100, 'Founder name must be less than 100 characters'),
    founder_email: z.string().email('Invalid email format'),
    website_url: z
      .string()
      .min(1, 'Website URL is required')
      .url('Please enter a valid URL (e.g., https://example.com)'),

    // Voice recording questions (all optional since they can be filled progressively)
    business_description: z
      .string()
      .min(1, 'Business description is required')
      .optional(),
    environmental_problem: z
      .string()
      .min(1, 'Environmental problem description is required')
      .optional(),
    business_model: z
      .string()
      .min(1, 'Business model description is required')
      .optional(),
    key_achievements: z
      .string()
      .min(1, 'Key achievements description is required')
      .optional(),
    funding_use: z
      .string()
      .min(1, 'Funding use description is required')
      .optional(),
    future_goals: z
      .string()
      .min(1, 'Future goals description is required')
      .optional(),
    competitors: z
      .string()
      .min(1, 'Competitors description is required')
      .optional(),
    unique_positioning: z
      .string()
      .min(1, 'Unique positioning description is required')
      .optional(),

    // Optional file upload
    financial_statements_url: z.string().url('Invalid URL format').optional(),

    // Allow additional fields for flexibility
  })
  .passthrough()

// Complete form data schema for final submission (all required fields)
export const grantApplicationCompleteFormSchema = z
  .object({
    company_name: z.string().min(1, 'Company name is required').max(100),
    founder_name: z.string().min(1, 'Founder name is required').max(100),
    founder_email: z.string().email('Invalid email format'),
    website_url: z
      .string()
      .min(1, 'Website URL is required')
      .url('Please enter a valid URL (e.g., https://example.com)'),

    // All voice recording questions required for submission
    business_description: z.string().min(1, 'Business description is required'),
    environmental_problem: z
      .string()
      .min(1, 'Environmental problem description is required'),
    business_model: z.string().min(1, 'Business model description is required'),
    key_achievements: z
      .string()
      .min(1, 'Key achievements description is required'),
    funding_use: z.string().min(1, 'Funding use description is required'),
    future_goals: z.string().min(1, 'Future goals description is required'),
    competitors: z.string().min(1, 'Competitors description is required'),
    unique_positioning: z
      .string()
      .min(1, 'Unique positioning description is required'),

    financial_statements_url: z.string().url('Invalid URL format').optional(),
  })
  .passthrough()

// Database insert schema (matches actual database structure)
export const grantApplicationInsertSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  status: applicationStatusSchema.nullable().default('draft'),
  form_data: grantApplicationFormDataSchema.nullable().optional(),
  make_webhook_id: z.string().max(255).nullable().optional(),
  make_status: z.string().max(50).nullable().optional(),
  created_at: z.string().datetime().nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
  makecom_submission_id: z.string().uuid().nullable().optional(),
})

// Database update schema (all fields optional)
export const grantApplicationUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  status: applicationStatusSchema.nullable().optional(),
  form_data: grantApplicationFormDataSchema.nullable().optional(),
  make_webhook_id: z.string().max(255).nullable().optional(),
  make_status: z.string().max(50).nullable().optional(),
  created_at: z.string().datetime().nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
  makecom_submission_id: z.string().uuid().nullable().optional(),
})

// Application section schema (matches actual database structure)
export const applicationSectionSchema = z.object({
  id: z.string().uuid().optional(),
  application_id: z.string().uuid().nullable().optional(),
  section_name: z.string().min(1).max(100),
  section_data: z.record(z.any()).nullable().optional(),
  is_completed: z.boolean().nullable().optional(),
  completion_percentage: z.number().int().min(0).max(100).nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
})

// Voice recording schema (matches actual voice_recording table we created)
export const voiceRecordingSchema = z.object({
  id: z.string().uuid().optional(),
  application_id: z.string().uuid(),
  field_name: voiceRecordingFieldSchema,
  audio_url: z.string().url('Invalid audio URL format'),
  transcription: z.string().nullable().optional(),
  duration: z.number().int().positive('Duration must be positive'),
  file_format: audioFileFormatSchema,
  created_at: z.string().datetime().nullable().optional(),
})

// Type exports
export type GrantApplicationFormDataType = z.infer<
  typeof grantApplicationFormDataSchema
>
export type GrantApplicationCompleteForm = z.infer<
  typeof grantApplicationCompleteFormSchema
>
export type GrantApplicationInsertData = z.infer<
  typeof grantApplicationInsertSchema
>
export type GrantApplicationUpdateData = z.infer<
  typeof grantApplicationUpdateSchema
>
export type ApplicationSectionData = z.infer<typeof applicationSectionSchema>
export type VoiceRecordingData = z.infer<typeof voiceRecordingSchema>
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>
export type VoiceRecordingField = z.infer<typeof voiceRecordingFieldSchema>
export type AudioFileFormat = z.infer<typeof audioFileFormatSchema>

// Validation helper functions
export const validateGrantApplicationFormData = (
  data: unknown
): GrantApplicationFormDataType => {
  return grantApplicationFormDataSchema.parse(data)
}

export const validateGrantApplicationCompleteForm = (
  data: unknown
): GrantApplicationCompleteForm => {
  return grantApplicationCompleteFormSchema.parse(data)
}

export const validateGrantApplicationInsert = (
  data: unknown
): GrantApplicationInsertData => {
  return grantApplicationInsertSchema.parse(data)
}

export const validateGrantApplicationUpdate = (
  data: unknown
): GrantApplicationUpdateData => {
  return grantApplicationUpdateSchema.parse(data)
}

export const validateApplicationSection = (
  data: unknown
): ApplicationSectionData => {
  return applicationSectionSchema.parse(data)
}

export const validateVoiceRecording = (data: unknown): VoiceRecordingData => {
  return voiceRecordingSchema.parse(data)
}
