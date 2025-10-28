import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateGrantApplicationInsert } from '@/lib/validation'

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

    return NextResponse.json({ applications })
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

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedSupabaseClient()
    const user = await getAuthenticatedUser(supabase)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateGrantApplicationInsert({
      ...body,
      user_id: user.id,
    })

    // Insert application
    const { data: application, error } = await supabase
      .from('applications')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid application data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
