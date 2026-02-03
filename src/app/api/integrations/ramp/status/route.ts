import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ connected: false, reason: 'Not authenticated' })
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ connected: false, reason: 'No organization' })
  }

  // Check if there's an active Ramp integration with a valid token
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, is_active')
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'ramp')
    .single()

  if (integration?.access_token && integration?.is_active) {
    return NextResponse.json({ connected: true })
  }

  return NextResponse.json({ connected: false, reason: 'Not connected' })
}

