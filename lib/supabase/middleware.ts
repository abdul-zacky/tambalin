import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Optimized session handling with minimal interference to client-side auth
  const startTime = Date.now()
  
  try {
    // Only check session for protected routes to avoid unnecessary delays
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') &&
                           !request.nextUrl.pathname.startsWith('/admin/auth/login')
    
    if (!isProtectedRoute) {
      return supabaseResponse
    }

    // Use Promise.race to prevent hanging with shorter timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 1000) // Reduced to 1s
    })

    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
    
    const duration = Date.now() - startTime
    if (duration > 500) { // Only log if it takes more than 500ms
      console.log(`🔍 Middleware session check took ${duration}ms`)
    }

    // Skip getUser call to let client-side handle it - this prevents conflicts
    // The client-side AuthProvider will handle user validation

    return supabaseResponse
  } catch (error) {
    console.error('❌ Middleware auth error:', error)
    return supabaseResponse
  }
}
