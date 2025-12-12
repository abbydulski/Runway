import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('Deel OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=deel_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=missing_params`)
  }

  try {
    // Decode state to get organization_id
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organization_id } = stateData

    // Exchange code for access token
    const tokenResponse = await fetch('https://app.deel.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.DEEL_CLIENT_ID!,
        client_secret: process.env.DEEL_CLIENT_SECRET!,
        code,
        redirect_uri: `${baseUrl}/api/integrations/deel/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Deel token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=token_exchange_failed`)
    }

    // Get organization info from Deel
    const orgResponse = await fetch('https://api.deel.com/rest/v2/organizations', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    })
    const orgData = await orgResponse.json()

    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'deel')
      .single()

    const integrationData = {
      organization_id,
      provider: 'deel' as const,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      provider_data: {
        organization: orgData.data?.[0] || null,
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

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=deel`)
  } catch (err) {
    console.error('Deel callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=callback_failed`)
  }
}

