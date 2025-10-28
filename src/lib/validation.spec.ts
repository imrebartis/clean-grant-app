/**
 * Application Validation Tests
 * Tests for Zod schemas used in grant application forms
 */

import {
  grantApplicationFormDataSchema,
  grantApplicationCompleteFormSchema,
  voiceRecordingSchema,
  type GrantApplicationFormDataType,
  type GrantApplicationCompleteForm,
} from './validation'

describe('Grant Application Validation Schemas', () => {
  describe('grantApplicationFormDataSchema', () => {
    describe('when validating valid form data', () => {
      it('should accept complete application form data', () => {
        const validData: GrantApplicationFormDataType = {
          company_name: 'EcoTech Solutions',
          founder_name: 'Jane Smith',
          founder_email: 'jane@ecotech.com',
          business_description:
            'We develop innovative solar panel technology that increases efficiency by 40%',
          environmental_problem:
            'Traditional solar panels are inefficient and expensive to manufacture',
          business_model:
            'We sell directly to residential customers and through partnerships with installers',
          key_achievements:
            'Secured 3 patents, built working prototype, gained 50 beta customers',
          funding_use:
            'Expand manufacturing capacity and hire 5 additional engineers',
          future_goals:
            'Scale to 10,000 customers and expand to commercial market',
          competitors:
            'SunPower and Tesla Solar, but our technology is 20% more efficient',
          unique_positioning:
            'Our patented nano-coating technology gives us a significant efficiency advantage',
        }

        const result = grantApplicationFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validData)
        }
      })

      it('should accept minimal required data', () => {
        const minimalData: GrantApplicationFormDataType = {
          company_name: 'Test Company',
          founder_name: 'Test Founder',
          founder_email: 'test@example.com',
          business_description: 'Test business description',
          environmental_problem: 'Test environmental problem',
          business_model: 'Test business model',
          key_achievements: 'Test achievements',
          funding_use: 'Test funding use',
          future_goals: 'Test future goals',
          competitors: 'Test competitors',
          unique_positioning: 'Test positioning',
        }

        const result = grantApplicationFormDataSchema.safeParse(minimalData)
        expect(result.success).toBe(true)
      })
    })

    describe('when validating invalid form data', () => {
      it('should reject empty company name', () => {
        const invalidData = {
          company_name: '',
          founder_name: 'Test Founder',
          founder_email: 'test@example.com',
          business_description: 'Test description',
          environmental_problem: 'Test problem',
          business_model: 'Test model',
          key_achievements: 'Test achievements',
          funding_use: 'Test funding',
          future_goals: 'Test goals',
          competitors: 'Test competitors',
          unique_positioning: 'Test positioning',
        }

        const result = grantApplicationFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('company_name')
        }
      })

      it('should reject invalid email format', () => {
        const invalidData = {
          company_name: 'Test Company',
          founder_name: 'Test Founder',
          founder_email: 'invalid-email',
          business_description: 'Test description',
          environmental_problem: 'Test problem',
          business_model: 'Test model',
          key_achievements: 'Test achievements',
          funding_use: 'Test funding',
          future_goals: 'Test goals',
          competitors: 'Test competitors',
          unique_positioning: 'Test positioning',
        }

        const result = grantApplicationFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('founder_email')
        }
      })

      it('should accept partial data since all fields are optional in form data schema', () => {
        const partialData = {
          company_name: 'Test Company',
          founder_name: 'Test Founder',
          founder_email: 'test@example.com',
          // Missing voice response fields - should be OK for progressive form filling
        }

        const result = grantApplicationFormDataSchema.safeParse(partialData)
        expect(result.success).toBe(true) // Should pass since fields are optional
      })
    })
  })

  describe('grantApplicationCompleteFormSchema', () => {
    describe('when validating complete form for submission', () => {
      it('should require all fields for submission', () => {
        const incompleteData = {
          company_name: 'Test Company',
          founder_name: 'Test Founder',
          founder_email: 'test@example.com',
          // Missing required voice response fields
        }

        const result =
          grantApplicationCompleteFormSchema.safeParse(incompleteData)
        expect(result.success).toBe(false)
      })

      it('should accept complete data for submission', () => {
        const completeData: GrantApplicationCompleteForm = {
          company_name: 'Test Company',
          founder_name: 'Test Founder',
          founder_email: 'test@example.com',
          business_description: 'Complete business description',
          environmental_problem: 'Complete environmental problem',
          business_model: 'Complete business model',
          key_achievements: 'Complete achievements',
          funding_use: 'Complete funding use',
          future_goals: 'Complete future goals',
          competitors: 'Complete competitors',
          unique_positioning: 'Complete positioning',
        }

        const result =
          grantApplicationCompleteFormSchema.safeParse(completeData)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('voiceRecordingSchema', () => {
    describe('when validating voice recording data', () => {
      it('should accept valid voice recording data', () => {
        const validRecording = {
          application_id: '550e8400-e29b-41d4-a716-446655440000',
          field_name: 'business_description' as const,
          audio_url: 'https://example.com/audio.mp3',
          transcription: 'This is a test transcription',
          duration: 120,
          file_format: 'mp3' as const,
        }

        const result = voiceRecordingSchema.safeParse(validRecording)
        if (!result.success) {
          console.log('Voice recording validation errors:', result.error.issues)
        }
        expect(result.success).toBe(true)
      })

      it('should reject invalid field names', () => {
        const invalidRecording = {
          field_name: 'invalid_field',
          audio_url: 'https://example.com/audio.mp3',
          transcription: 'Test transcription',
          duration: 120,
          file_format: 'mp3',
        }

        const result = voiceRecordingSchema.safeParse(invalidRecording)
        expect(result.success).toBe(false)
      })

      it('should reject invalid file formats', () => {
        const invalidRecording = {
          field_name: 'business_description',
          audio_url: 'https://example.com/audio.mp3',
          transcription: 'Test transcription',
          duration: 120,
          file_format: 'invalid_format',
        }

        const result = voiceRecordingSchema.safeParse(invalidRecording)
        expect(result.success).toBe(false)
      })
    })
  })
})
