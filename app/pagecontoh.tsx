'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default function Home() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-[#274b76]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent mb-4">
            Welcome to Tambalin
          </h1>

          {user ? (
            <div className="mt-8 space-y-6">
              <p className="text-lg text-[#274b76]/80">
                You are logged in as {profile?.full_name || profile?.email}
              </p>

              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 max-w-md mx-auto border border-[#274b76]/10">
                <h2 className="text-2xl font-semibold text-[#274b76] mb-6">
                  Your Profile
                </h2>
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center p-3 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
                    <span className="text-[#274b76]/70 font-medium">Name:</span>
                    <span className="text-[#274b76] font-semibold">
                      {profile?.full_name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
                    <span className="text-[#274b76]/70 font-medium">Email:</span>
                    <span className="text-[#274b76] font-semibold">
                      {profile?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
                    <span className="text-[#274b76]/70 font-medium">Role:</span>
                    <span className="text-[#274b76] font-semibold capitalize">
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <div className="mt-8">
                  <Link
                    href="/admin"
                    className="inline-block px-8 py-4 text-white bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Go to Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-12 space-y-8">
              <p className="text-xl text-[#274b76]/80">
                Please log in or sign up to continue
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/auth/login"
                  className="px-8 py-4 text-white bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl min-w-[180px] text-center transform hover:-translate-y-0.5"
                >
                  User Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 text-[#274b76] bg-white hover:bg-blue-50 border-2 border-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl min-w-[180px] text-center transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>

              <div className="pt-8 border-t border-[#274b76]/20 mt-12 max-w-md mx-auto">
                <p className="text-sm text-[#274b76]/60 mb-4 font-medium">
                  Administrator?
                </p>
                <Link
                  href="/admin/auth/login"
                  className="inline-block px-8 py-3 text-white bg-linear-to-r from-[#1e3a5f] to-[#274b76] hover:from-[#152943] hover:to-[#1e3a5f] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}