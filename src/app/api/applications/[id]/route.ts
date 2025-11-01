import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return handleDatabaseError(error, 'fetch')
    }

    // Transform response to match expected format
    const responseApplication = {
      ...application,
      title: application.company_name || 'Untitled Application',
      form_data: {
        company_name: application.company_name,
        founder_name: application.founder_name,
        founder_email: application.founder_email,
        website_url: application.website_url,
        business_description: application.business_description,
        environmental_problem: application.environmental_problem,
        business_model: application.business_model,
        key_achievements: application.key_achievements,
        funding_use: application.funding_use,
        future_goals: application.future_goals,
        competitors: application.competitors,
        unique_positioning: application.unique_positioning,
        financial_statements_url: application.financial_statements_url,
      },
    }

    return NextResponse.json({ application: responseApplication })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

interface FormData {
  company_name?: string
  founder_name?: string
  founder_email?: string
  website_url?: string
  business_description?: string
  environmental_problem?: string
  business_model?: string
  key_achievements?: string[]
  funding_use?: string
  future_goals?: string[]
  competitors?: string
  unique_positioning?: string
  financial_statements_url?: string
}

interface UpdateData {
  updated_at: string
  company_name?: string
  founder_name?: string
  founder_email?: string
  website_url?: string
  business_description?: string
  environmental_problem?: string
  business_model?: string
  key_achievements?: string[]
  funding_use?: string
  future_goals?: string[]
  competitors?: string
  unique_positioning?: string
  financial_statements_url?: string
  status?: string
}

async function getValidatedUpdateBody(request: NextRequest) {
  const body = await request.json()
  const { form_data, title, status } = body

  return { form_data, title, status }
}

function createUpdateData(
  form_data?: FormData,
  title?: string,
  status?: string
): UpdateData {
  const updateData: UpdateData = {
    updated_at: new Date().toISOString(),
  }

  if (form_data) {
    // Manually assign each field to ensure type safety
    if (form_data.company_name !== undefined)
      updateData.company_name = form_data.company_name
    if (form_data.founder_name !== undefined)
      updateData.founder_name = form_data.founder_name
    if (form_data.founder_email !== undefined)
      updateData.founder_email = form_data.founder_email
    if (form_data.business_description !== undefined)
      updateData.business_description = form_data.business_description
    if (form_data.environmental_problem !== undefined)
      updateData.environmental_problem = form_data.environmental_problem
    if (form_data.business_model !== undefined)
      updateData.business_model = form_data.business_model
    if (form_data.key_achievements !== undefined)
      updateData.key_achievements = form_data.key_achievements
    if (form_data.funding_use !== undefined)
      updateData.funding_use = form_data.funding_use
    if (form_data.future_goals !== undefined)
      updateData.future_goals = form_data.future_goals
    if (form_data.competitors !== undefined)
      updateData.competitors = form_data.competitors
    if (form_data.unique_positioning !== undefined)
      updateData.unique_positioning = form_data.unique_positioning
    if (form_data.financial_statements_url !== undefined)
      updateData.financial_statements_url = form_data.financial_statements_url
  }

  // Update title if provided (map to company_name for now)
  if (title !== undefined) {
    updateData.company_name = title
  }

  // Update status if provided
  if (status !== undefined) {
    updateData.status = status
  }

  return updateData
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { form_data, title, status } = await getValidatedUpdateBody(request)

    const updateData = createUpdateData(form_data, title, status)

    // Update title if provided (map to company_name for now)
    if (title !== undefined) {
      updateData.company_name = title
    }

    // Update status if provided
    if (status !== undefined) {
      updateData.status = status
    }

    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return handleDatabaseError(error, 'update')
    }

    return NextResponse.json({
      application: transformApplicationResponse(application),
    })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

function createSupabaseClient() {
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

function handleDatabaseError(error: { code?: string }, operation: string) {
  if (error.code === 'PGRST116') {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  console.error('Database error:', error)
  return NextResponse.json(
    { error: `Failed to ${operation} application` },
    { status: 500 }
  )
}

interface ApplicationResponse extends Omit<UpdateData, 'updated_at'> {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  status: string
}

function transformApplicationResponse(application: ApplicationResponse) {
  return {
    ...application,
    title: application.company_name,
    form_data: {
      company_name: application.company_name,
      founder_name: application.founder_name,
      founder_email: application.founder_email,
      business_description: application.business_description,
      environmental_problem: application.environmental_problem,
      business_model: application.business_model,
      key_achievements: application.key_achievements,
      funding_use: application.funding_use,
      future_goals: application.future_goals,
      competitors: application.competitors,
      unique_positioning: application.unique_positioning,
      financial_statements_url: application.financial_statements_url,
    },
  }
}

function handleUnexpectedError(error: unknown) {
  console.error('Unexpected error:', error)

  if (error instanceof Error && error.message.includes('validation')) {
    return NextResponse.json(
      { error: 'Invalid application data', details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
