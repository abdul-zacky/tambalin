'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Simple admin key validation (in production, use environment variable)
    if (adminKey !== 'ADMIN_SECRET_KEY_2024') {
      setError('Invalid admin key')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
          },
        },
      })

      if (error) throw error

      router.push('/admin')
      router.refresh()
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
            Admin Sign Up
          </h1>
          <p className="text-center text-sm text-[#274b76]/60 mb-8 font-medium">
            Restricted Access - Admin Key Required
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="adminKey" className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                Admin Key
              </label>
              <input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#1e3a5f]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-[#1e3a5f] placeholder-[#1e3a5f]/40"
                placeholder="Enter admin key"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#1e3a5f]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-[#1e3a5f] placeholder-[#1e3a5f]/40"
                placeholder="Admin Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                Email
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
                minLength={6}
                className="w-full px-4 py-3 border-2 border-[#1e3a5f]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-[#1e3a5f] placeholder-[#1e3a5f]/40"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#1e3a5f]/60">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#1e3a5f] to-[#274b76] hover:from-[#152943] hover:to-[#1e3a5f] disabled:from-[#1e3a5f]/50 disabled:to-[#274b76]/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating admin account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#274b76]/70">
              Already have an admin account?{' '}
              <Link href="/admin/auth/login" className="text-[#1e3a5f] hover:text-[#152943] font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
