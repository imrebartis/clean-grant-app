// Core Application Types
export interface GrantApplication {
  id: string
  user_id: string
  company_name: string
  founder_name: string
  founder_email: string
  business_description: string
  environmental_problem: string
  business_model: string
  key_achievements: string
  funding_use: string
  future_goals: string
  competitors: string
  unique_positioning: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface VoiceRecording {
  id: string
  application_id: string
  field_name: string
  audio_url: string
  transcription: string
  duration: number
  file_format: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}
