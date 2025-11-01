import { type GrantApplicationFormDataType } from '@/types'

export function normalizeFormData(formData: GrantApplicationFormDataType) {
  return {
    ...formData,
    company_name: formData.company_name || '',
    founder_name: formData.founder_name || '',
    founder_email: formData.founder_email || '',
    website_url: formData.website_url || '', // This was missing!
    business_description: formData.business_description || '',
    environmental_problem: formData.environmental_problem || '',
    business_model: formData.business_model || '',
    key_achievements: formData.key_achievements || '',
    funding_use: formData.funding_use || '',
    future_goals: formData.future_goals || '',
    competitors: formData.competitors || '',
    unique_positioning: formData.unique_positioning || '',
    financial_statements_url: formData.financial_statements_url || undefined,
  }
}

export function getApplicationTitle(
  formData: GrantApplicationFormDataType,
  isDraft = false
) {
  return (
    formData.company_name ||
    (isDraft ? 'Untitled Application' : 'Grant Application')
  )
}
