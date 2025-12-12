import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id, organization_id, team_id } = await request.json()

    if (!user_id || !organization_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get team config if team_id provided
    let teamConfig = null
    if (team_id) {
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', team_id)
        .single()
      teamConfig = team
    }

    // Get connected integrations for this org
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('is_active', true)

    const results: { provider: string; status: string; error?: string }[] = []

    // Process each integration
    for (const integration of integrations || []) {
      try {
        let result = { provider: integration.provider, status: 'skipped' }

        switch (integration.provider) {
          case 'slack':
            if (teamConfig?.slack_config?.channels?.length > 0) {
              // TODO: Call Slack API to invite user
              result = await provisionSlack(integration, user, teamConfig)
            }
            break

          case 'github':
            if (teamConfig?.github_config?.teams?.length > 0) {
              // TODO: Call GitHub API to add user to org/teams
              result = await provisionGitHub(integration, user, teamConfig)
            }
            break

          case 'deel':
            if (teamConfig?.deel_config?.contract_type) {
              // TODO: Call Deel API to create contractor
              result = await provisionDeel(integration, user, teamConfig)
            }
            break
        }

        results.push(result)

        // Log the provisioning attempt
        await supabase.from('provisioning_logs').insert({
          user_id,
          organization_id,
          integration_id: integration.id,
          action: 'provision',
          status: result.status,
          details: result,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          provider: integration.provider,
          status: 'error',
          error: errorMessage,
        })

        await supabase.from('provisioning_logs').insert({
          user_id,
          organization_id,
          integration_id: integration.id,
          action: 'provision',
          status: 'error',
          details: { error: errorMessage },
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Provisioning error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Slack provisioning - looks up user by email and adds to channels
async function provisionSlack(
  integration: { access_token?: string },
  user: { email: string; name: string },
  teamConfig: { slack_config?: { channels?: string[] } }
): Promise<{ provider: string; status: string; details?: unknown; error?: string }> {
  const accessToken = integration.access_token
  if (!accessToken) {
    return { provider: 'slack', status: 'error', error: 'No access token' }
  }

  const channels = teamConfig.slack_config?.channels || []
  if (channels.length === 0) {
    return { provider: 'slack', status: 'skipped', details: 'No channels configured' }
  }

  try {
    // Step 1: Look up user by email in Slack
    const userLookupRes = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(user.email)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    const userLookup = await userLookupRes.json()

    if (!userLookup.ok) {
      return {
        provider: 'slack',
        status: 'error',
        error: `User not found in Slack: ${userLookup.error}`,
      }
    }

    const slackUserId = userLookup.user.id
    const addedChannels: string[] = []
    const failedChannels: { channel: string; error: string }[] = []

    // Step 2: Get list of channels to find IDs
    const channelsListRes = await fetch(
      'https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    const channelsList = await channelsListRes.json()

    if (!channelsList.ok) {
      return {
        provider: 'slack',
        status: 'error',
        error: `Failed to list channels: ${channelsList.error}`,
      }
    }

    // Create a map of channel names to IDs
    const channelMap: Record<string, string> = {}
    for (const ch of channelsList.channels || []) {
      channelMap[ch.name] = ch.id
    }

    // Step 3: Add user to each configured channel
    for (const channelName of channels) {
      // Remove # prefix if present
      const cleanName = channelName.replace(/^#/, '')
      const channelId = channelMap[cleanName]

      if (!channelId) {
        failedChannels.push({ channel: cleanName, error: 'Channel not found' })
        continue
      }

      const inviteRes = await fetch('https://slack.com/api/conversations.invite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          users: slackUserId,
        }),
      })
      const inviteResult = await inviteRes.json()

      if (inviteResult.ok) {
        addedChannels.push(cleanName)
      } else if (inviteResult.error === 'already_in_channel') {
        addedChannels.push(cleanName) // Count as success
      } else {
        failedChannels.push({ channel: cleanName, error: inviteResult.error })
      }
    }

    return {
      provider: 'slack',
      status: failedChannels.length === 0 ? 'success' : 'partial',
      details: {
        slackUserId,
        addedChannels,
        failedChannels,
      },
    }
  } catch (error) {
    return {
      provider: 'slack',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function provisionGitHub(
  integration: { access_token?: string },
  user: { email: string; name: string },
  teamConfig: { github_config?: { teams?: string[] } }
) {
  // TODO: Implement GitHub org invitation
  console.log('Would invite to GitHub:', user.email, teamConfig.github_config?.teams)
  return { provider: 'github', status: 'pending_implementation' }
}

async function provisionDeel(
  integration: { access_token?: string },
  user: { email: string; name: string },
  teamConfig: { deel_config?: { contract_type?: string } }
) {
  // TODO: Implement Deel contractor creation
  console.log('Would create Deel contract:', user.email, teamConfig.deel_config?.contract_type)
  return { provider: 'deel', status: 'pending_implementation' }
}

