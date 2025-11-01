import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper function to create authenticated Supabase client
function createAuthenticatedSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Helper function to get authenticated user
async function getAuthenticatedUser(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  return user
}

// GET /api/applications - List user's applications
export async function GET() {
  try {
    const supabase = createAuthenticatedSupabaseClient()
    const user = await getAuthenticatedUser(supabase)

    // Fetch user's applications
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Transform applications to match expected format
    // The database stores fields as individual columns, but the frontend expects them in form_data
    const transformedApplications =
      applications?.map(app => ({
        ...app,
        title: app.title || 'Untitled Application',
        form_data: {
          // Map database columns to form_data structure
          company_name: app.company_name || '',
          founder_name: app.founder_name || '',
          founder_email: app.founder_email || '',
          website_url: app.website_url || '',
          business_description: app.business_description || '',
          environmental_problem: app.environmental_problem || '',
          business_model: app.business_model || '',
          key_achievements: app.key_achievements || '',
          funding_use: app.funding_use || '',
          future_goals: app.future_goals || '',
          competitors: app.competitors || '',
          unique_positioning: app.unique_positioning || '',
          financial_statements_url: app.financial_statements_url || null,
        },
      })) || []

    return NextResponse.json({ applications: transformedApplications })
  } catch (error) {
    console.error('Unexpected error:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Types for application data
interface ApplicationFormData {
  company_name?: string
  founder_name?: string
  founder_email?: string
  business_description?: string
  environmental_problem?: string
  business_model?: string
  key_achievements?: string
  funding_use?: string
  future_goals?: string
  competitors?: string
  unique_positioning?: string
  financial_statements_url?: string | null
  website_url?: string
}

interface ApplicationRequestData {
  title: string
  form_data?: ApplicationFormData
  status?: 'draft' | 'submitted'
}

// Helper function to validate application data
function validateApplicationData(data: unknown): {
  isValid: boolean
  error?: NextResponse
} {
  // Type guard to check if data is ApplicationRequestData
  const isApplicationData = (obj: unknown): obj is ApplicationRequestData => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'title' in obj &&
      typeof (obj as { title: unknown }).title === 'string'
    )
  }

  if (!isApplicationData(data)) {
    return {
      isValid: false,
      error: NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      ),
    }
  }
  if (!data.title || typeof data.title !== 'string') {
    return {
      isValid: false,
      error: NextResponse.json({ error: 'Title is required' }, { status: 400 }),
    }
  }
  return { isValid: true }
}

// Helper function to prepare application data for database
function prepareApplicationData(userId: string, data: ApplicationRequestData) {
  const { title, form_data = {}, status = 'draft' } = data

  // Map form_data to individual database columns (matching the schema)
  return {
    user_id: userId,
    title,
    company_name: form_data.company_name || '',
    founder_name: form_data.founder_name || '',
    founder_email: form_data.founder_email || '',
    website_url: form_data.website_url || '',
    business_description: form_data.business_description || '',
    environmental_problem: form_data.environmental_problem || '',
    business_model: form_data.business_model || '',
    key_achievements: form_data.key_achievements || '',
    funding_use: form_data.funding_use || '',
    future_goals: form_data.future_goals || '',
    competitors: form_data.competitors || '',
    unique_positioning: form_data.unique_positioning || '',
    financial_statements_url: form_data.financial_statements_url || null,
    status,
  }
}

// Types for application response
interface ApplicationResponse {
  id: string
  title: string
  company_name: string
  founder_name: string
  founder_email: string
  website_url: string
  business_description: string
  environmental_problem: string
  business_model: string
  key_achievements: string
  funding_use: string
  future_goals: string
  competitors: string
  unique_positioning: string
  financial_statements_url: string | null
  status: string
  [key: string]: unknown // For any additional properties
}

function formatApplicationResponse(application: ApplicationResponse) {
  return {
    ...application,
    title: application.title,
    form_data: {
      // Map database columns to form_data structure for consistency
      company_name: application.company_name || '',
      founder_name: application.founder_name || '',
      founder_email: application.founder_email || '',
      website_url: application.website_url || '',
      business_description: application.business_description || '',
      environmental_problem: application.environmental_problem || '',
      business_model: application.business_model || '',
      key_achievements: application.key_achievements || '',
      funding_use: application.funding_use || '',
      future_goals: application.future_goals || '',
      competitors: application.competitors || '',
      unique_positioning: application.unique_positioning || '',
      financial_statements_url: application.financial_statements_url || null,
    },
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedSupabaseClient()
    const user = await getAuthenticatedUser(supabase)
    const body = await request.json()

    // Validate request data
    const { isValid, error: validationError } = validateApplicationData(body)
    if (!isValid) return validationError

    // Prepare and insert application data
    const applicationData = prepareApplicationData(user.id, body)
    const { data: application, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    // Format and return response
    const responseApplication = formatApplicationResponse(application)
    return NextResponse.json(
      { application: responseApplication },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
