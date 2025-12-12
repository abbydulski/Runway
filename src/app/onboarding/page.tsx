'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, User, Building2, Wrench, Users, MessageSquare, ExternalLink, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface SlackConfig {
  invite_link?: string
}

interface TeamConfig {
  slack_config?: { channels?: string[] }
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [slackInviteLink, setSlackInviteLink] = useState<string | null>(null)
  const [slackChannels, setSlackChannels] = useState<string[]>([])
  const [slackJoined, setSlackJoined] = useState(false)
  const [addingToChannels, setAddingToChannels] = useState(false)
  const [channelsAdded, setChannelsAdded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOnboardingData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*, teams(slack_config)')
        .eq('id', user.id)
        .single()

      // Founders skip onboarding
      if (profile?.role === 'founder') {
        router.push('/dashboard')
        return
      }

      // Already completed onboarding
      if (profile?.onboarding_completed) {
        router.push('/employee')
        return
      }

      setUserId(user.id)
      setOrgId(profile?.organization_id)
      setTeamId(profile?.team_id)

      // Get Slack invite link from org's integration
      if (profile?.organization_id) {
        const { data: slackIntegration } = await supabase
          .from('integrations')
          .select('config')
          .eq('organization_id', profile.organization_id)
          .eq('provider', 'slack')
          .single()

        if (slackIntegration?.config?.invite_link) {
          setSlackInviteLink(slackIntegration.config.invite_link)
        }
      }

      // Get team's Slack channels
      if (profile?.teams?.slack_config?.channels) {
        setSlackChannels(profile.teams.slack_config.channels)
      }

      setLoading(false)
    }
    loadOnboardingData()
  }, [router, supabase])

  const handleJoinedSlack = async () => {
    setSlackJoined(true)
    setAddingToChannels(true)
    setError(null)

    try {
      const response = await fetch('/api/provisioning/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          organization_id: orgId,
          team_id: teamId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setChannelsAdded(true)
      } else {
        setError(result.error || 'Failed to add to channels')
      }
    } catch (e) {
      setError('Failed to connect to Slack')
    }
    setAddingToChannels(false)
  }

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
    }
    router.push('/employee')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ASC" width={24} height={24} />
            <span className="text-xl font-bold">ASC</span>
          </div>
          <Badge variant="outline">Onboarding</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to the team! 🎉</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s get you set up with all the tools you need
          </p>
        </div>

        {/* Slack Integration Card */}
        {slackInviteLink && (
          <Card className={channelsAdded ? 'border-green-200 bg-green-50/50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Join Slack
                {channelsAdded && <Badge className="bg-green-500">Complete</Badge>}
              </CardTitle>
              <CardDescription>
                Join our Slack workspace to connect with your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!slackJoined ? (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm mb-3">
                      Click below to join our Slack workspace, then come back here to get added to your team channels.
                    </p>
                    {slackChannels.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        You&apos;ll be added to: {slackChannels.map(c => `#${c}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button asChild>
                      <a href={slackInviteLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Slack Invite
                      </a>
                    </Button>
                    <Button variant="outline" onClick={handleJoinedSlack}>
                      I&apos;ve Joined Slack
                    </Button>
                  </div>
                </>
              ) : addingToChannels ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding you to team channels...
                </div>
              ) : channelsAdded ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  You&apos;ve been added to your team&apos;s Slack channels!
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleJoinedSlack}>
                    Try Again
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* No Slack message */}
        {!slackInviteLink && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Your admin hasn&apos;t set up Slack integration yet. You can continue with onboarding.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Other onboarding steps placeholder */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>Add your information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleComplete}>
            Complete Onboarding
          </Button>
        </div>
      </main>
    </div>
  )
}

