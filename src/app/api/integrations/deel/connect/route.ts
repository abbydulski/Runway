import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL))
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL))
  }

  // Deel OAuth URL
  // Note: Deel uses OAuth 2.0 - you'll need to register your app at https://developer.deel.com
  const clientId = process.env.DEEL_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/deel/callback`
  const scopes = 'openid profile email contracts:write contracts:read people:write people:read'

  // Store org_id in state for callback
  const state = Buffer.from(JSON.stringify({ 
    organization_id: profile.organization_id 
  })).toString('base64')

  // Deel OAuth authorization URL
  const deelAuthUrl = `https://app.deel.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.redirect(deelAuthUrl)
}

