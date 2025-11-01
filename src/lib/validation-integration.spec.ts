import {
  grantApplicationFormDataSchema,
  grantApplicationInsertSchema,
  validateGrantApplicationFormData,
  type GrantApplication,
  type GrantApplicationFormDataType,
  type UserId,
  type ApplicationId,
} from '../types'

describe('Validation Integration', () => {
  describe('when working with JSON-based form data structure', () => {
    it('should validate form data for the form_data JSONB field', () => {
      const formData: GrantApplicationFormDataType = {
        company_name: 'CleanTech Innovations',
        founder_name: 'Sarah Johnson',
        founder_email: 'sarah@cleantech.com',
        website_url: 'https://cleantech-innovations.example.com',
        business_description:
          'We develop advanced water purification systems using AI-driven filtration technology',
        environmental_problem:
          'Over 2 billion people lack access to clean drinking water worldwide',
        business_model:
          'B2B sales to municipalities and NGOs, with subscription-based maintenance services',
        key_achievements:
          'Deployed systems in 15 communities, reduced waterborne illness by 80%, secured $500K seed funding',
        funding_use:
          'Scale manufacturing to serve 100,000 people, establish regional distribution centers',
        future_goals:
          'Become the leading water purification provider in developing regions within 5 years',
        competitors:
          'LifeStraw and Sawyer Products, but our AI optimization provides 3x better efficiency',
        unique_positioning:
          'Our proprietary AI algorithms optimize filtration in real-time based on water quality sensors',
        financial_statements_url: 'https://example.com/financials.pdf',
      }

      const validatedForm = validateGrantApplicationFormData(formData)
      expect(validatedForm).toEqual(formData)

      const applicationData = {
        title: 'Clean Water Innovation Grant Application',
        user_id: '550e8400-e29b-41d4-a716-446655440000' as UserId,
        form_data: validatedForm,
        status: 'draft' as const,
      }

      const validatedInsert =
        grantApplicationInsertSchema.parse(applicationData)
      expect(validatedInsert.form_data?.company_name).toBe(
        formData.company_name
      )
      expect(validatedInsert.form_data?.founder_email).toBe(
        formData.founder_email
      )
      expect(validatedInsert.form_data?.business_description).toBe(
        formData.business_description
      )
    })

    it('should handle optional fields correctly in form data', () => {
      const minimalFormData: GrantApplicationFormDataType = {
        company_name: 'Minimal Company',
        founder_name: 'John Doe',
        founder_email: 'john@minimal.com',
        website_url: 'https://minimal-company.example.com',
      }

      const validated = validateGrantApplicationFormData(minimalFormData)
      expect(validated.financial_statements_url).toBeUndefined()
      expect(validated.company_name).toBe('Minimal Company')
      expect(validated.business_description).toBeUndefined()
    })
  })

  describe('when working with existing GrantApplication interface', () => {
    it('should be compatible with JSON-based GrantApplication structure', () => {
      const existingApp: Partial<GrantApplication> = {
        id: '550e8400-e29b-41d4-a716-446655440001' as ApplicationId,
        user_id: '550e8400-e29b-41d4-a716-446655440002' as UserId,
        title: 'Existing Grant Application',
        status: 'submitted',
        form_data: {
          company_name: 'Existing Company',
          founder_name: 'Jane Doe',
          founder_email: 'jane@existing.com',
          website_url: 'https://existing-company.example.com',
          business_description: 'Existing business description',
          environmental_problem: 'Existing environmental problem',
          business_model: 'Existing business model',
          key_achievements: 'Existing achievements',
          funding_use: 'Existing funding use',
          future_goals: 'Existing goals',
          competitors: 'Existing competitors',
          unique_positioning: 'Existing positioning',
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      if (existingApp.form_data) {
        const validation = grantApplicationFormDataSchema.safeParse(
          existingApp.form_data
        )
        expect(validation.success).toBe(true)

        if (validation.success) {
          expect(validation.data.company_name).toBe('Existing Company')
          expect(validation.data.founder_email).toBe('jane@existing.com')
        }
      }
    })

    it('should handle applications with null form_data', () => {
      const emptyApp: Partial<GrantApplication> = {
        id: '550e8400-e29b-41d4-a716-446655440003' as ApplicationId,
        user_id: '550e8400-e29b-41d4-a716-446655440004' as UserId,
        title: 'Empty Application',
        status: 'draft',
        form_data: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(emptyApp.form_data).toBeNull()

      const validation = grantApplicationFormDataSchema.safeParse({})
      expect(validation.success).toBe(false)

      const appValidation = grantApplicationInsertSchema.safeParse({
        title: 'Test Application',
        form_data: null,
      })
      expect(appValidation.success).toBe(true)
    })
  })
})
