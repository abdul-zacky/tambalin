import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  console.log('=== DEBUG AUTH ===');
  console.log('Session error:', sessionError);
  console.log('Has session:', !!session);
  console.log('User ID:', session?.user?.id);
  console.log('User email:', session?.user?.email);

  if (!session?.user) {
    return NextResponse.json({
      authenticated: false,
      error: 'No session found',
      sessionError: sessionError?.message
    });
  }

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  console.log('Profile error:', profileError);
  console.log('Profile:', profile);
  console.log('==================');

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    profile: profile,
    profileError: profileError?.message,
    isAdmin: profile?.role === 'admin'
  });
}
