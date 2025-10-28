/**
 * Supabase Database Types
 * Updated to match actual database schema from Supabase.com
 *
 * Key differences from original expectations:
 * - Applications use JSONB form_data instead of individual columns
 * - Application sections have different structure with section_data (JSONB)
 * - References auth.users directly in applications table
 * - Additional fields like avatar_url, is_completed, completion_percentage
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string // uuid, references auth.users
          email: string // text, not null
          full_name: string | null
          avatar_url: string | null // Additional field in actual DB
          created_at: string | null // timestamp with time zone
          updated_at: string | null // timestamp with time zone
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      applications: {
        Row: {
          id: string // uuid, primary key
          user_id: string | null // uuid, references auth.users (not profiles!)
          title: string // character varying(255), not null
          status: 'draft' | 'submitted' | 'processing' | 'completed' | null // application_status enum
          form_data: Record<string, unknown> | null // jsonb - all form fields stored here
          make_webhook_id: string | null // character varying(255)
          make_status: string | null // character varying(50)
          created_at: string | null // timestamp with time zone
          updated_at: string | null // timestamp with time zone
          makecom_submission_id: string | null // uuid, references makecom_submissions
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          status?: 'draft' | 'submitted' | 'processing' | 'completed' | null
          form_data?: Record<string, unknown> | null
          make_webhook_id?: string | null
          make_status?: string | null
          created_at?: string | null
          updated_at?: string | null
          makecom_submission_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          status?: 'draft' | 'submitted' | 'processing' | 'completed' | null
          form_data?: Record<string, unknown> | null
          make_webhook_id?: string | null
          make_status?: string | null
          created_at?: string | null
          updated_at?: string | null
          makecom_submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'applications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_makecom_submission'
            columns: ['makecom_submission_id']
            referencedRelation: 'makecom_submissions'
            referencedColumns: ['id']
          },
        ]
      }
      application_sections: {
        Row: {
          id: string // uuid, primary key
          application_id: string | null // uuid, references applications(id)
          section_name: string // character varying(100), not null
          section_data: Record<string, unknown> | null // jsonb, not 'content'
          is_completed: boolean | null // Additional field
          completion_percentage: number | null // Additional field (integer)
          updated_at: string | null // timestamp with time zone (no created_at)
        }
        Insert: {
          id?: string
          application_id?: string | null
          section_name: string
          section_data?: Record<string, unknown> | null
          is_completed?: boolean | null
          completion_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string | null
          section_name?: string
          section_data?: Record<string, unknown> | null
          is_completed?: boolean | null
          completion_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'application_sections_application_id_fkey'
            columns: ['application_id']
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
      voice_recording: {
        Row: {
          id: string // uuid, primary key
          application_id: string | null // uuid, references applications(id)
          field_name:
            | 'business_description'
            | 'environmental_problem'
            | 'business_model'
            | 'key_achievements'
            | 'funding_use'
            | 'future_goals'
            | 'competitors'
            | 'unique_positioning'
          audio_url: string // text, not null
          transcription: string | null // text, default ''
          duration: number // integer, not null (seconds)
          file_format: 'mp3' | 'm4a' | 'wav' // character varying(10)
          created_at: string | null // timestamp with time zone
        }
        Insert: {
          id?: string
          application_id?: string | null
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
          transcription?: string | null
          duration: number
          file_format: 'mp3' | 'm4a' | 'wav'
          created_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string | null
          field_name?:
            | 'business_description'
            | 'environmental_problem'
            | 'business_model'
            | 'key_achievements'
            | 'funding_use'
            | 'future_goals'
            | 'competitors'
            | 'unique_positioning'
          audio_url?: string
          transcription?: string | null
          duration?: number
          file_format?: 'mp3' | 'm4a' | 'wav'
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'voice_recording_application_id_fkey'
            columns: ['application_id']
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
      makecom_submissions: {
        Row: {
          id: string
          application_id: string
          webhook_url: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          google_doc_url: string | null
          response_data: Record<string, unknown> | null
          error_message: string | null
          submitted_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          application_id: string
          webhook_url: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          google_doc_url?: string | null
          response_data?: Record<string, unknown> | null
          error_message?: string | null
          submitted_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string
          webhook_url?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          google_doc_url?: string | null
          response_data?: Record<string, unknown> | null
          error_message?: string | null
          submitted_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'makecom_submissions_application_id_fkey'
            columns: ['application_id']
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: 'draft' | 'submitted' | 'processing' | 'completed'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types for convenience
export type Profile = Tables<'profiles'>
export type Application = Tables<'applications'>
export type ApplicationSection = Tables<'application_sections'>
export type VoiceRecording = Tables<'voice_recording'>
export type MakecomSubmission = Tables<'makecom_submissions'>

export type ProfileInsert = TablesInsert<'profiles'>
export type ApplicationInsert = TablesInsert<'applications'>
export type ApplicationSectionInsert = TablesInsert<'application_sections'>
export type VoiceRecordingInsert = TablesInsert<'voice_recording'>
export type MakecomSubmissionInsert = TablesInsert<'makecom_submissions'>

export type ProfileUpdate = TablesUpdate<'profiles'>
export type ApplicationUpdate = TablesUpdate<'applications'>
export type ApplicationSectionUpdate = TablesUpdate<'application_sections'>
export type VoiceRecordingUpdate = TablesUpdate<'voice_recording'>
export type MakecomSubmissionUpdate = TablesUpdate<'makecom_submissions'>
