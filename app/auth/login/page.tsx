'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        setError('Please use the admin login page')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

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
          {/* Logo and Brand */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Tambalin Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-2xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent">
                Tambalin
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-center text-[#274b76]">
              Masuk ke Akun Anda
            </h1>
            <p className="text-sm text-[#274b76]/60 mt-2 text-center">
              Temukan bengkel terdekat dengan mudah
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder-[#274b76]/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] disabled:from-[#274b76]/50 disabled:to-[#3d6ba8]/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#274b76]/70">
              Belum punya akun?{' '}
              <Link href="/auth/signup" className="text-[#274b76] hover:text-[#1e3a5f] font-semibold">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
