import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('Ramp OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=ramp_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=missing_params`)
  }

  try {
    // Decode state to get organization_id
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organization_id } = stateData

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.ramp.com/developer/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.RAMP_CLIENT_ID!,
        client_secret: process.env.RAMP_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/integrations/ramp/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Ramp token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=token_exchange_failed`)
    }

    // Get business info
    const businessResponse = await fetch('https://api.ramp.com/developer/v1/business', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    })
    const businessData = await businessResponse.json()

    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'ramp')
      .single()

    const integrationData = {
      organization_id,
      provider: 'ramp' as const,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      provider_data: {
        business_id: businessData.id,
        business_name: businessData.business_name_legal || businessData.business_name_on_card,
        scope: tokenData.scope,
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

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=ramp`)
  } catch (err) {
    console.error('Ramp callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=callback_failed`)
  }
}

