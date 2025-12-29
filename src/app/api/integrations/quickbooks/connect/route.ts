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

  // QuickBooks OAuth URL
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const redirectUri = `${baseUrl}/api/integrations/quickbooks/callback`
  
  // QuickBooks OAuth scopes
  const scopes = [
    'com.intuit.quickbooks.accounting',
    'openid',
    'profile',
    'email',
  ].join(' ')

  // Store org_id in state for callback
  const state = Buffer.from(JSON.stringify({ 
    organization_id: profile.organization_id 
  })).toString('base64')

  // QuickBooks uses sandbox vs production URLs
  const isSandbox = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
  const authBaseUrl = 'https://appcenter.intuit.com/connect/oauth2'

  const qbAuthUrl = `${authBaseUrl}?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`

  return NextResponse.redirect(qbAuthUrl)
}

