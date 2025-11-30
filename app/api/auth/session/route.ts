import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ session: null })
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
        },
      }
    )

    // Quick session check with timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 1000)
    })

    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
    
    return NextResponse.json({ 
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
        }
      } : null 
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ session: null })
  }
}