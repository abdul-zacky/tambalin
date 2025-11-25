'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const getFirstName = (fullName: string | null | undefined, email: string | null | undefined): string => {
    if (fullName && fullName.trim()) {
      const firstName = fullName.split(' ')[0].trim()
      if (firstName) return firstName
    }
    if (email) {
      const emailName = email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    return 'User'
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-[#274b76]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-linear-to-r from-[#274b76] to-[#3d6ba8] bg-clip-text text-transparent cursor-pointer">
              Tambalin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-[#274b76]/80 font-medium">
                  {getFirstName(profile?.full_name, profile?.email)}
                  {profile?.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-linear-to-r from-[#274b76] to-[#3d6ba8] text-white rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-semibold text-[#274b76] hover:text-[#1e3a5f] transition-colors cursor-pointer"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-[#274b76] hover:text-[#1e3a5f] transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#274b76] to-[#3d6ba8] hover:from-[#1e3a5f] hover:to-[#274b76] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Sign Up
                </Link>
                <Link
                  href="/admin/auth/login"
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#1e3a5f] to-[#274b76] hover:from-[#152943] hover:to-[#1e3a5f] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
