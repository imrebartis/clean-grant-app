import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateGrantApplicationUpdate } from '@/lib/validation'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/applications/[id] - Get specific application
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

    return NextResponse.json({ application })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

// PUT /api/applications/[id] - Update application
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

    const body = await request.json()
    const validatedData = validateGrantApplicationUpdate({
      ...body,
      updated_at: new Date().toISOString(),
    })

    const { data: application, error } = await supabase
      .from('applications')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return handleDatabaseError(error, 'update')
    }

    return NextResponse.json({ application })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

// DELETE /api/applications/[id] - Delete application
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
