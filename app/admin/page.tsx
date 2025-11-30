'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

// Skeleton component for loading states
function DashboardSkeleton() {
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-[#274b76]/10 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-1 w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-[#274b76]/10 mb-8">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}

// Stats card component with individual loading states
function StatsCard({ title, value, subtitle, loading, children }: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  loading?: boolean; 
  children?: React.ReactNode 
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-[#274b76]/10 relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#274b76]/20 border-t-transparent"></div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-[#274b76] mb-2">{title}</h3>
      <div className="flex items-baseline">
        <p className={`text-3xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
          {loading ? '...' : value}
        </p>
        {subtitle && (
          <p className="text-sm text-[#274b76]/60 mt-1 ml-2">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [statsLoading, setStatsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    systemStatus: 'Online'
  })

  // Fetch admin stats with caching and retry logic
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Initial stats fetch
  useEffect(() => {
    if (profile && !authLoading) {
      fetchStats()
    }
  }, [profile, authLoading])

  // Background refresh every 30 seconds
  useEffect(() => {
    if (profile && !authLoading) {
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [profile, authLoading, fetchStats])

  useEffect(() => {
    // Only redirect if loading is complete and we have definitive auth state
    if (!authLoading) {
      if (!profile) {
        console.log('🔄 No profile found, redirecting to login')
        router.replace('/admin/auth/login')
      } else if (profile.role !== 'admin') {
        console.log('🔄 Non-admin user, redirecting to home')
        router.replace('/')
      }
    }
  }, [profile, authLoading, router])

  // Add early session validation to prevent unnecessary redirects
  useEffect(() => {
    const checkEarlySession = async () => {
      if (authLoading) {
        // Check if we have a valid session cookie to show appropriate loading state
        try {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            if (!data.session) {
              console.log('🔄 No session found, preparing redirect')
              // Don't redirect immediately, let the main useEffect handle it
            }
          }
        } catch (error) {
          // Silently handle session check errors
        }
      }
    }

    checkEarlySession()
  }, [authLoading])

  if (authLoading) {
    return <DashboardSkeleton />
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
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Active accounts"
            loading={statsLoading}
          />
          <StatsCard
            title="Administrators"
            value={stats.totalAdmins}
            subtitle="Admin accounts"
            loading={statsLoading}
          />
          <StatsCard
            title="System Status"
            value={stats.systemStatus}
            subtitle="All systems operational"
            loading={statsLoading}
          >
            <div className="mt-2">
              <div className={`w-3 h-3 rounded-full ${stats.systemStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </StatsCard>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-[#274b76]/10 mb-8">
          <h2 className="text-2xl font-semibold text-[#274b76] mb-6">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/shops"
              className="p-6 bg-linear-to-r from-blue-50 to-transparent rounded-xl border-2 border-[#274b76]/20 hover:border-[#274b76] transition-all duration-300 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-[#274b76] mb-2">Manage Shops</h3>
              <p className="text-sm text-[#274b76]/70">View, add, edit, and delete motorcycle repair shops</p>
            </Link>
            <div className="p-6 bg-linear-to-r from-blue-50 to-transparent rounded-xl border-2 border-[#274b76]/20 opacity-50">
              <h3 className="text-lg font-semibold text-[#274b76] mb-2">Manage Reviews</h3>
              <p className="text-sm text-[#274b76]/70">Coming soon</p>
            </div>
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
