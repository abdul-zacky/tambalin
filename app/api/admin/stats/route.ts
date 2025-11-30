import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: true })
    
    // Get total admins count
    const { count: totalAdmins, error: adminsError } = await supabase
      .from('profiles')
      .select('id', { count: true })
      .eq('role', 'admin')
    
    if (usersError || adminsError) {
      console.error('Error fetching stats:', usersError || adminsError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }
    
    // Check system status (you could expand this with actual health checks)
    const systemStatus = 'Online'
    
    const stats = {
      totalUsers: totalUsers || 0,
      totalAdmins: totalAdmins || 0,
      systemStatus,
      lastUpdated: new Date().toISOString()
    }
    
    // Cache headers to improve performance
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
        'ETag': `"${Date.now()}"`, // ETag for cache validation
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}