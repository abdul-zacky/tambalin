'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const supabase = await createClient()

  // Set the session server-side, which will set the cookies
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
