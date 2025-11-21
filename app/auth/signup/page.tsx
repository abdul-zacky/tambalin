'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user',
          },
        },
      })

      if (error) throw error

      router.push('/')
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
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl px-8 py-10 border border-[#274b76]/10">
          <h1 className="text-3xl font-bold text-center mb-8 bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent">
            User Sign Up
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#274b76] mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder-[#274b76]/40"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#274b76] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder-[#274b76]/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#274b76] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder-[#274b76]/40"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#274b76]/60">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] disabled:from-[#274b76]/50 disabled:to-[#3d6ba8]/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#274b76]/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#274b76] hover:text-[#1e3a5f] font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
