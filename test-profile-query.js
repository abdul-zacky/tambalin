// Quick test to check profile query speed
// Run with: node test-profile-query.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testProfileQuery() {
  console.log('Testing profile query speed...')

  // Replace with your admin user ID from the logs
  const userId = '99d4a1ee-9348-47fe-8959-a84c93e0dac6'

  const start = Date.now()

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const duration = Date.now() - start

    console.log(`Query completed in ${duration}ms`)

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Profile:', data)
    }
  } catch (err) {
    const duration = Date.now() - start
    console.error(`Query failed after ${duration}ms:`, err)
  }
}

testProfileQuery()
