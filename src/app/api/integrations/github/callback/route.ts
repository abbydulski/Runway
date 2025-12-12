import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=github_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=missing_params`)
  }

  try {
    // Decode state to get organization_id
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organization_id } = stateData

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${baseUrl}/api/integrations/github/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('GitHub token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=token_exchange_failed`)
    }

    // Get user info to find their orgs
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const userData = await userResponse.json()

    // Get user's organizations
    const orgsResponse = await fetch('https://api.github.com/user/orgs', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const orgsData = await orgsResponse.json()

    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'github')
      .single()

    const integrationData = {
      organization_id,
      provider: 'github' as const,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      provider_data: {
        username: userData.login,
        user_id: userData.id,
        organizations: orgsData.map((org: { login: string; id: number }) => ({
          login: org.login,
          id: org.id,
        })),
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

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=github`)
  } catch (err) {
    console.error('GitHub callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=callback_failed`)
  }
}

