import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const realmId = searchParams.get('realmId') // QuickBooks company ID
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('QuickBooks OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=quickbooks_denied`)
  }

  if (!code || !state || !realmId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=missing_params`)
  }

  try {
    // Decode state to get organization_id
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organization_id } = stateData

    // Exchange code for access token
    const clientId = process.env.QUICKBOOKS_CLIENT_ID!
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
    const redirectUri = `${baseUrl}/api/integrations/quickbooks/callback`
    
    // Create Basic auth header
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('QuickBooks token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=token_exchange_failed`)
    }

    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'quickbooks')
      .single()

    const integrationData = {
      organization_id,
      provider: 'quickbooks' as const,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      provider_data: {
        realm_id: realmId, // QuickBooks company ID - needed for API calls
        token_type: tokenData.token_type,
        x_refresh_token_expires_in: tokenData.x_refresh_token_expires_in,
      },
      is_active: true,
    }

    if (existing) {
      await supabase
        .from('integrations')
        .update(integrationData)
        .eq('id', existing.id)
    } else {
      await supabase.from('integrations').insert(integrationData)
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=quickbooks`)
  } catch (err) {
    console.error('QuickBooks callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=callback_failed`)
  }
}

