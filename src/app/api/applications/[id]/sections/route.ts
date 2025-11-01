import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

function createServiceSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for service role client
        },
      },
    }
  )
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

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const { data: sections, error } = await supabase
      .from('application_sections')
      .select('*')
      .eq('application_id', params.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch application sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sections: sections || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface SectionData {
  section_name: string
  section_data?: Record<string, unknown>
  is_completed?: boolean
  completion_percentage?: number
}

interface Section {
  id: string
  application_id: string
  section_name: string
  section_data: Record<string, unknown>
  is_completed: boolean
  completion_percentage: number
  created_at: string
  updated_at: string
}

async function verifyApplicationOwnership(
  supabase: ReturnType<typeof createSupabaseClient>,
  applicationId: string,
  userId: string
) {
  const { data: application, error } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .single()

  if (error || !application) {
    throw new Error('Application not found')
  }
  return application
}

async function findExistingSection(
  supabase: ReturnType<typeof createSupabaseClient>,
  applicationId: string,
  sectionName: string
) {
  const { data: section } = await supabase
    .from('application_sections')
    .select('id')
    .eq('application_id', applicationId)
    .eq('section_name', sectionName)
    .single()
  return section
}

async function updateSection(
  supabase: ReturnType<typeof createSupabaseClient>,
  sectionId: string,
  sectionData: Omit<Section, 'id' | 'created_at' | 'application_id'> & {
    updated_at?: string
  }
) {
  const { data: section, error } = await supabase
    .from('application_sections')
    .update(sectionData)
    .eq('id', sectionId)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw new Error('Failed to update application section')
  }
  return section
}

async function createSection(
  supabase: ReturnType<typeof createSupabaseClient>,
  sectionData: Omit<Section, 'id' | 'created_at' | 'updated_at'>
) {
  // Use service role client to bypass RLS for this operation
  const serviceSupabase = createServiceSupabaseClient()

  const { data: section, error } = await serviceSupabase
    .from('application_sections')
    .insert(sectionData)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw new Error('Failed to create application section')
  }
  return section
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createSupabaseClient()
    const user = await authenticateUser(supabase)

    await verifyApplicationOwnership(supabase, params.id, user.id)

    const sectionData = await parseAndValidateRequestBody(request, params.id)
    const existingSection = await findExistingSection(
      supabase,
      params.id,
      sectionData.section_name
    )

    const result = await createOrUpdateSection(
      supabase,
      existingSection,
      sectionData
    )

    return NextResponse.json(
      { section: result },
      { status: existingSection ? 200 : 201 }
    )
  } catch (error) {
    return handlePostError(error)
  }
}

async function authenticateUser(
  supabase: ReturnType<typeof createSupabaseClient>
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

async function parseAndValidateRequestBody(
  request: NextRequest,
  applicationId: string
) {
  const body = await request.json()
  const { section_name, section_data, is_completed, completion_percentage } =
    body as SectionData

  if (!section_name) {
    throw new Error('Section name is required')
  }

  return {
    application_id: applicationId,
    section_name,
    section_data: section_data || {},
    is_completed: is_completed || false,
    completion_percentage: completion_percentage || 0,
  }
}

async function createOrUpdateSection(
  supabase: ReturnType<typeof createSupabaseClient>,
  existingSection: { id: string } | null,
  sectionData: Omit<Section, 'id' | 'created_at' | 'updated_at'>
) {
  return existingSection
    ? await updateSection(supabase, existingSection.id, {
        ...sectionData,
        updated_at: new Date().toISOString(),
      })
    : await createSection(supabase, sectionData)
}

function handlePostError(error: unknown) {
  console.error('Unexpected error:', error)

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Application not found') {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    if (error.message === 'Section name is required') {
      return NextResponse.json(
        { error: 'Section name is required' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
