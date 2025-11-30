'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/database.types'

type Profile = Tables<'profiles'>

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const refreshProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error getting user in refreshProfile:', userError)
        return
      }

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile in refreshProfile:', profileError)
        } else {
          setProfile(profile)
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error)
    }
  }

  useEffect(() => {
    console.log('🔄 Setting up auth listener...')

    let isMounted = true
    let isInitialized = false
    let fetchingProfile = false
    let authStateChangeHandled = false

    // Cache for profile data to reduce database queries
    const profileCache = new Map<string, { profile: Profile | null; timestamp: number }>()
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    const fetchProfile = async (userId: string, useCache = true, priority = false) => {
      if (fetchingProfile && !priority) {
        console.log('⏭️ Profile fetch already in progress, skipping...')
        return null
      }

      // Check cache first (but allow bypass for initial auth)
      const cached = profileCache.get(userId)
      if (useCache && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📋 Using cached profile for user:', userId)
        if (isMounted) {
          setProfile(cached.profile)
        }
        return cached.profile
      }

      fetchingProfile = true
      const startTime = Date.now()
      console.log('📝 Fetching profile for user:', userId, useCache ? '(with cache)' : '(no cache)')

      try {
        // Reduced timeout for faster page refresh - 8s instead of 15s
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout after 8s')), 8000)
        })

        const fetchPromise = supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, updated_at') // Only select needed fields
          .eq('id', userId)
          .single()

        const result = await Promise.race([fetchPromise, timeoutPromise]) as { data: Profile | null; error: { message: string; details?: unknown; hint?: string; code?: string } | null }
        const { data: profile, error: profileError } = result

        const duration = Date.now() - startTime
        console.log(`⏱️ Profile query took ${duration}ms`)

        if (!isMounted) return null

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError)
          // Use cached profile if available during errors
          const existingProfile = profileCache.get(userId)?.profile
          if (existingProfile) {
            console.log('🔄 Using existing cached profile due to error')
            setProfile(existingProfile)
          } else {
            setProfile(null)
          }
          profileCache.set(userId, { profile: null, timestamp: Date.now() })
          return null
        } else {
          console.log('✅ Profile fetched:', profile)
          setProfile(profile)
          profileCache.set(userId, { profile, timestamp: Date.now() })
          return profile
        }
      } catch (error) {
        const duration = Date.now() - startTime
        console.error(`❌ Exception fetching profile after ${duration}ms:`, error)
        // Use cached profile during timeouts
        const existingProfile = profileCache.get(userId)?.profile
        if (existingProfile && duration > 3000) { // Use cache for any timeout over 3s
          console.log('🔄 Using existing cached profile due to timeout')
          setProfile(existingProfile)
        } else if (isMounted) {
          setProfile(null)
          profileCache.set(userId, { profile: null, timestamp: Date.now() })
        }
        return null
      } finally {
        fetchingProfile = false
        if (isMounted && !isInitialized) {
          console.log('✅ Setting loading to false (after profile fetch)')
          setLoading(false)
          isInitialized = true
        }
      }
    }

    // Initialize auth state with session restoration from cookies
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing auth state from cookies...')
        const startTime = Date.now()
        
        // Add timeout to session retrieval to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 5000) // 5s timeout for session
        })

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
        
        const duration = Date.now() - startTime
        console.log(`🔍 Session retrieval took ${duration}ms`)
        
        if (!isMounted) return
        
        if (session) {
          console.log('✅ Session restored from cookies:', session.user?.id)
          setUser(session.user)
          
          // Fetch profile with cache enabled for faster page refresh
          await fetchProfile(session.user.id, true, true) // Priority fetch
        } else {
          console.log('🔍 No session found in cookies')
          setUser(null)
          setProfile(null)
        }
        
        if (isMounted && !isInitialized) {
          console.log('✅ Setting loading to false (after initial auth check)')
          setLoading(false)
          isInitialized = true
        }
      } catch (error) {
        console.error('❌ Error during auth initialization:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          isInitialized = true
        }
      }
    }

    // Initialize auth state first
    initializeAuth()

    // Listen to auth state changes - but skip the initial SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.id)

        if (!isMounted) return

        // Skip the first SIGNED_IN event to avoid duplicate profile fetch
        if (event === 'SIGNED_IN' && !authStateChangeHandled) {
          authStateChangeHandled = true
          console.log('⏭️ Skipping initial SIGNED_IN event to prevent duplicate fetch')
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          // For subsequent auth changes, use cache to improve performance
          await fetchProfile(session.user.id, true)
        } else {
          setProfile(null)
          if (!isInitialized) {
            console.log('✅ Setting loading to false (no user)')
            setLoading(false)
            isInitialized = true
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
