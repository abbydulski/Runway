import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/dashboard', baseUrl))
  }

  // Ramp OAuth URL
  const clientId = process.env.RAMP_CLIENT_ID
  const redirectUri = `${baseUrl}/api/integrations/ramp/callback`
  
  // Ramp scopes for reading transactions, cards, users, etc.
  const scopes = [
    'transactions:read',
    'users:read',
    'cards:read',
    'reimbursements:read',
    'bills:read',
    'business:read',
  ].join(' ')

  // Store org_id in state for callback
  const state = Buffer.from(JSON.stringify({ 
    organization_id: profile.organization_id 
  })).toString('base64')

  const rampAuthUrl = `https://app.ramp.com/v1/authorize?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.redirect(rampAuthUrl)
}

