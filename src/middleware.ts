import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const createSupabaseClient = (request: NextRequest, response: NextResponse) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

const isProtectedRoute = (pathname: string): boolean => {
  const protectedPaths = ['/dashboard', '/applications']
  return protectedPaths.some(path => pathname.startsWith(path))
}

const isEmailAllowed = (email: string): boolean => {
  const allowedEmails = process.env.ALLOWED_EMAILS || ''
  return allowedEmails
    .split(',')
    .map(e => e.trim())
    .includes(email)
}

const handleAuthRedirects = (
  user: { email?: string } | null,
  pathname: string,
  requestUrl: string
) => {
  const url = new URL(requestUrl)

  // If already on auth page with access_denied error, don't redirect again
  if (
    pathname === '/auth' &&
    url.searchParams.get('error') === 'access_denied'
  ) {
    return null
  }

  // Check email whitelist for authenticated users - redirect to landing page gracefully
  if (user && user.email && !isEmailAllowed(user.email)) {
    // Sign out the user and redirect to landing page without error message
    return NextResponse.redirect(new URL('/', requestUrl))
  }

  // Redirect unauthenticated users from protected routes to landing page
  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect(new URL('/', requestUrl))
  }

  if (
    pathname === '/auth' &&
    user &&
    user.email &&
    isEmailAllowed(user.email)
  ) {
    return NextResponse.redirect(new URL('/dashboard', requestUrl))
  }

  return null
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createSupabaseClient(request, response)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const redirect = handleAuthRedirects(user, pathname, request.url)
  return redirect || response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
