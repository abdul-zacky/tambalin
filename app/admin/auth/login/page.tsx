'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { setSessionCookies } from './actions'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Use sequential auth first, then profile check to avoid race conditions
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Set session cookies server-side for API routes to access
      if (data.session) {
        const cookieResult = await setSessionCookies(
          data.session.access_token,
          data.session.refresh_token
        )

        if (!cookieResult.success) {
          console.error('Failed to set session cookies:', cookieResult.error)
        }
      }

      // Optimized admin check with better error handling
      try {
        const profilePromise = supabase
          .from('profiles')
          .select('role') // Only select the role field
          .eq('id', data.user.id)
          .single()

        // Add longer timeout for admin check
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Admin check timeout after 5s')), 5000)
        })

        const profileResult = await Promise.race([profilePromise, timeoutPromise]) as { data: { role: string } | null; error: { message: string; details?: unknown; hint?: string; code?: string } | null }
        const { data: profile, error: profileError } = profileResult

        if (profileError || profile?.role !== 'admin') {
          setError('Access denied. Admin privileges required.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        // Use replace instead of push to prevent back navigation to login
        router.replace('/admin')
        router.refresh()
      } catch (profileErr) {
        console.error('Profile check error:', profileErr)
        // If profile check fails, but auth succeeded, let user in with warning
        setError('Unable to verify admin privileges. Please try again.')
        // Don't sign out - let user continue to admin page
        router.replace('/admin')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl px-8 py-10 border-t-4 border-[#1e3a5f]">
          <h1 className="text-3xl font-bold text-center mb-2 bg-linear-to-r from-[#1e3a5f] to-[#274b76] bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-center text-sm text-[#274b76]/60 mb-8 font-medium">
            Restricted Access
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#1e3a5f]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-[#1e3a5f] placeholder-[#1e3a5f]/40"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#1e3a5f]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-[#1e3a5f] placeholder-[#1e3a5f]/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#1e3a5f] to-[#274b76] hover:from-[#152943] hover:to-[#1e3a5f] disabled:from-[#1e3a5f]/50 disabled:to-[#274b76]/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#274b76]/70">
              Not an admin?{' '}
              <Link href="/auth/login" className="text-[#274b76] hover:text-[#1e3a5f] font-semibold">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
