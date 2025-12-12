import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('Slack OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=slack_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=missing_params`)
  }

  try {
    // Decode state to get organization_id
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organization_id } = stateData

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${baseUrl}/api/integrations/slack/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=token_exchange_failed`)
    }

    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'slack')
      .single()

    const integrationData = {
      organization_id,
      provider: 'slack' as const,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      provider_data: {
        team_id: tokenData.team?.id,
        team_name: tokenData.team?.name,
        bot_user_id: tokenData.bot_user_id,
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

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=slack`)
  } catch (err) {
    console.error('Slack callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=callback_failed`)
  }
}

