'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default function AdminDashboard() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push('/admin/auth/login')
      } else if (profile.role !== 'admin') {
        router.push('/')
      }
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-[#274b76]">Loading...</div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#1e3a5f] to-[#274b76] bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[#274b76]/70">Manage your application</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-[#274b76]/10">
            <h3 className="text-lg font-semibold text-[#274b76] mb-2">Total Users</h3>
            <p className="text-3xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent">0</p>
            <p className="text-sm text-[#274b76]/60 mt-1">Active accounts</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-[#274b76]/10">
            <h3 className="text-lg font-semibold text-[#274b76] mb-2">Administrators</h3>
            <p className="text-3xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent">1</p>
            <p className="text-sm text-[#274b76]/60 mt-1">Admin accounts</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-[#274b76]/10">
            <h3 className="text-lg font-semibold text-[#274b76] mb-2">System Status</h3>
            <p className="text-xl font-bold text-green-600">Online</p>
            <p className="text-sm text-[#274b76]/60 mt-1">All systems operational</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-[#274b76]/10">
          <h2 className="text-2xl font-semibold text-[#274b76] mb-6">
            Admin Profile
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
              <span className="text-[#274b76]/70 font-medium">Name:</span>
              <span className="text-[#274b76] font-semibold">
                {profile.full_name || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
              <span className="text-[#274b76]/70 font-medium">Email:</span>
              <span className="text-[#274b76] font-semibold">
                {profile.email}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-transparent rounded-lg">
              <span className="text-[#274b76]/70 font-medium">Role:</span>
              <span className="px-3 py-1 bg-linear-to-r from-[#1e3a5f] to-[#274b76] text-white rounded-full text-sm font-semibold">
                Administrator
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="px-6 py-3 text-[#274b76] bg-white hover:bg-blue-50 border-2 border-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
