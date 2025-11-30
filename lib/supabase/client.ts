import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false, // Set to true for debugging auth issues
      },
      cookieOptions: {
        name: 'sb-auth-token',
        domain: '',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'tambalin-admin/1.0.0',
        },
      },
    }
  )
}
