// Form steps configuration
export const FORM_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your company and contact details',
    fields: ['company_name', 'founder_name', 'founder_email', 'website_url'],
  },
  {
    id: 'business-overview',
    title: 'Business Overview',
    description: 'Describe your business and what you do',
    fields: ['business_description', 'environmental_problem'],
  },
  {
    id: 'business-model',
    title: 'Business Model & Achievements',
    description: 'How you make money and what you have achieved',
    fields: ['business_model', 'key_achievements'],
  },
  {
    id: 'funding-goals',
    title: 'Funding & Future Goals',
    description: 'How you will use funding and your future plans',
    fields: ['funding_use', 'future_goals'],
  },
  {
    id: 'competitive-landscape',
    title: 'Competitive Landscape',
    description: 'Your competition and unique positioning',
    fields: ['competitors', 'unique_positioning'],
  },
  {
    id: 'financial-documents',
    title: 'Financial Documents',
    description: 'Upload your financial statements',
    fields: ['financial_statements_url'],
  },
] as const

// Voice recording questions mapping
export const VOICE_QUESTIONS = {
  business_description:
    'Describe your business in 2 minutes - what do you do and who do you serve?',
  environmental_problem: 'What environmental problem are you solving?',
  business_model: "What's your business model - how do you make money?",
  key_achievements: 'What are your key achievements in the last 12 months?',
  funding_use: 'What would you use this grant funding for specifically?',
  future_goals: 'What are your goals for the next 2 years?',
  competitors: 'Who are your main competitors or alternatives?',
  unique_positioning: 'Why is your company uniquely positioned to succeed?',
} as const
