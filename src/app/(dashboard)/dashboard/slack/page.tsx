'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageSquare, Users, Hash, Bell, CheckCircle2, AlertCircle, Loader2, ExternalLink, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SlackIntegration {
  id: string
  access_token: string
  provider_data: {
    team_id?: string
    team_name?: string
    bot_user_id?: string
  }
  config?: {
    invite_link?: string
  }
}

export default function SlackPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [integration, setIntegration] = useState<SlackIntegration | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadIntegration = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      const { data: slackInt } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('provider', 'slack')
        .single()

      if (slackInt) {
        setIntegration(slackInt)
        setInviteLink(slackInt.config?.invite_link || '')
      }

      setLoading(false)
    }
    loadIntegration()
  }, [supabase])

  const handleSaveInviteLink = async () => {
    if (!integration) return
    setSaving(true)

    await supabase
      .from('integrations')
      .update({
        config: { ...integration.config, invite_link: inviteLink }
      })
      .eq('id', integration.id)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const handleConnect = () => {
    window.location.href = '/api/integrations/slack/connect'
  }

  const handleDisconnect = async () => {
    if (!integration) return

    await supabase
      .from('integrations')
      .delete()
      .eq('id', integration.id)

    setIntegration(null)
  }

  const isConnected = !!integration?.access_token

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Slack
        </h1>
        <p className="text-muted-foreground">
          Manage Slack workspace access and channel memberships
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                {isConnected
                  ? `Connected to ${integration.provider_data?.team_name || 'Slack Workspace'}`
                  : 'Slack workspace integration'
                }
              </CardDescription>
            </div>
            <Badge
              variant={isConnected ? 'default' : 'outline'}
              className={`gap-1 ${isConnected ? 'bg-green-500' : ''}`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Connected to <strong>{integration.provider_data?.team_name}</strong>
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Workspace
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Slack workspace to automatically invite new employees,
                add them to channels, and send welcome messages.
              </p>
              <Button onClick={handleConnect}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Connect Slack Workspace
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Invite Link Configuration */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Invite Link</CardTitle>
            <CardDescription>
              Provide an invite link for new employees to join your Slack workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Slack Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  placeholder="https://join.slack.com/t/your-workspace/..."
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                />
                <Button onClick={handleSaveInviteLink} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get this from Slack → Settings → Invite People → Create Invite Link
              </p>
            </div>
            {inviteLink && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Invite link configured
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspace Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Public channels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Team activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Do</CardTitle>
          <CardDescription>Available features when connected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Auto-invite New Employees</p>
                <p className="text-sm text-muted-foreground">
                  Automatically invite new hires to your Slack workspace
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Channel Membership</p>
                <p className="text-sm text-muted-foreground">
                  Add employees to relevant channels based on their team
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Welcome Messages</p>
                <p className="text-sm text-muted-foreground">
                  Send automated welcome messages to new team members
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Profile Setup</p>
                <p className="text-sm text-muted-foreground">
                  Pre-fill employee profiles with title and department
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

