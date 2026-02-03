'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ExternalLink, Loader2, AlertCircle, CheckCircle, Save } from 'lucide-react'
import type { Integration, IntegrationProvider } from '@/types'

interface IntegrationConfig {
  provider: IntegrationProvider
  name: string
  description: string
  icon: string
  color: string
  docsUrl: string
}

const ALL_INTEGRATIONS: Record<string, IntegrationConfig> = {
  slack: {
    provider: 'slack',
    name: 'Slack',
    description: 'Invite employees to your Slack workspace and add them to team channels automatically.',
    icon: '💬',
    color: 'bg-purple-500',
    docsUrl: 'https://api.slack.com/apps',
  },
  github: {
    provider: 'github',
    name: 'GitHub',
    description: 'Add employees to your GitHub organization and assign them to the right teams.',
    icon: '🐙',
    color: 'bg-gray-800',
    docsUrl: 'https://github.com/settings/apps',
  },
  deel: {
    provider: 'deel',
    name: 'Deel',
    description: 'Automatically create contractor or employee contracts for new hires.',
    icon: '💼',
    color: 'bg-blue-600',
    docsUrl: 'https://developer.deel.com/',
  },
  quickbooks: {
    provider: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync employee data with QuickBooks for payroll and expense tracking.',
    icon: '📊',
    color: 'bg-green-600',
    docsUrl: 'https://developer.intuit.com/',
  },
  google_workspace: {
    provider: 'google_workspace' as IntegrationProvider,
    name: 'Google Workspace',
    description: 'Create Google accounts and add to shared drives.',
    icon: '📧',
    color: 'bg-red-500',
    docsUrl: 'https://developers.google.com/workspace',
  },
  microsoft_365: {
    provider: 'microsoft_365' as IntegrationProvider,
    name: 'Microsoft 365',
    description: 'Provision Microsoft accounts and Teams access.',
    icon: '🪟',
    color: 'bg-blue-500',
    docsUrl: 'https://developer.microsoft.com/',
  },
  notion: {
    provider: 'notion' as IntegrationProvider,
    name: 'Notion',
    description: 'Add employees to your Notion workspace.',
    icon: '📝',
    color: 'bg-gray-900',
    docsUrl: 'https://developers.notion.com/',
  },
  linear: {
    provider: 'linear' as IntegrationProvider,
    name: 'Linear',
    description: 'Add employees to Linear projects and teams.',
    icon: '📋',
    color: 'bg-indigo-600',
    docsUrl: 'https://linear.app/developers',
  },
  stripe: {
    provider: 'stripe' as IntegrationProvider,
    name: 'Stripe',
    description: 'View payment and revenue metrics.',
    icon: '💳',
    color: 'bg-purple-600',
    docsUrl: 'https://stripe.com/docs',
  },
  gusto: {
    provider: 'gusto' as IntegrationProvider,
    name: 'Gusto',
    description: 'Sync employee payroll and benefits.',
    icon: '💰',
    color: 'bg-orange-500',
    docsUrl: 'https://docs.gusto.com/',
  },
  mercury: {
    provider: 'mercury' as IntegrationProvider,
    name: 'Mercury',
    description: 'View banking and financial data.',
    icon: '🏦',
    color: 'bg-slate-800',
    docsUrl: 'https://mercury.com/',
  },
  ramp: {
    provider: 'ramp' as IntegrationProvider,
    name: 'Ramp',
    description: 'Corporate cards and expense management.',
    icon: '💳',
    color: 'bg-emerald-600',
    docsUrl: 'https://docs.ramp.com/',
  },
  onepassword: {
    provider: '1password' as IntegrationProvider,
    name: '1Password',
    description: 'Provision 1Password vaults and access.',
    icon: '🔐',
    color: 'bg-blue-700',
    docsUrl: 'https://developer.1password.com/',
  },
  ayer: {
    provider: 'ayer' as IntegrationProvider,
    name: 'Ayer',
    description: 'Field ticketing system - track linear feet, pricing, hours, and ticket status.',
    icon: '🎫',
    color: 'bg-amber-600',
    docsUrl: '#',
  },
}

// Integration Card Component
function IntegrationCard({
  config,
  connected,
  integration,
  connecting,
  slackInviteLink,
  setSlackInviteLink,
  savingSlackLink,
  saveSlackInviteLink,
  handleConnect,
  handleDisconnect,
  isSelected,
}: {
  config: IntegrationConfig
  connected: boolean
  integration: Integration | undefined
  connecting: string | null
  slackInviteLink: string
  setSlackInviteLink: (v: string) => void
  savingSlackLink: boolean
  saveSlackInviteLink: () => void
  handleConnect: (provider: IntegrationProvider) => void
  handleDisconnect: (provider: IntegrationProvider) => void
  isSelected: boolean
}) {
  return (
    <Card className={`${connected ? 'border-green-200 bg-green-50/50' : isSelected ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-2xl`}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.name}
                {connected && <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Connected</Badge>}
                {isSelected && !connected && <Badge variant="outline" className="text-primary border-primary">Selected</Badge>}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View docs <ExternalLink className="h-3 w-3" />
          </a>
          {connected ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDisconnect(config.provider)}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => handleConnect(config.provider)} disabled={connecting === config.provider}>
              {connecting === config.provider ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
              ) : (
                'Connect'
              )}
            </Button>
          )}
        </div>
        {connected && integration?.connected_at && (
          <p className="text-xs text-muted-foreground mt-3">
            Connected {new Date(integration.connected_at).toLocaleDateString()}
          </p>
        )}
        {/* Slack invite link input */}
        {connected && config.provider === 'slack' && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <Label htmlFor="slack-invite-link" className="text-sm font-medium">
                Workspace Invite Link
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Get this from Slack: Settings → Invite People → Copy Link
              </p>
              <div className="flex gap-2">
                <Input
                  id="slack-invite-link"
                  placeholder="https://join.slack.com/t/your-workspace/..."
                  value={slackInviteLink}
                  onChange={(e) => setSlackInviteLink(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={saveSlackInviteLink}
                  disabled={savingSlackLink || !slackInviteLink}
                >
                  {savingSlackLink ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Save className="h-4 w-4 mr-1" /> Save</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading integrations...</div>}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [slackInviteLink, setSlackInviteLink] = useState('')
  const [savingSlackLink, setSavingSlackLink] = useState(false)
  const [mercuryConnected, setMercuryConnected] = useState(false)
  const [rampConnected, setRampConnected] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success/error in URL params
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success) {
      setMessage({ type: 'success', text: `Successfully connected ${success}!` })
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/integrations')
    } else if (error) {
      const errorMessages: Record<string, string> = {
        slack_denied: 'Slack authorization was denied',
        github_denied: 'GitHub authorization was denied',
        deel_denied: 'Deel authorization was denied',
        missing_params: 'Missing required parameters',
        token_exchange_failed: 'Failed to exchange authorization code',
        callback_failed: 'OAuth callback failed',
      }
      setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred' })
      window.history.replaceState({}, '', '/dashboard/integrations')
    }

    fetchIntegrations()
  }, [searchParams])

  async function fetchIntegrations() {
    // Get user's organization to fetch selected integrations
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id)

        const { data: org } = await supabase
          .from('organizations')
          .select('selected_integrations')
          .eq('id', profile.organization_id)
          .single()

        if (org?.selected_integrations) {
          setSelectedIntegrations(org.selected_integrations)
        }
      }
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')

    if (!error && data) {
      setIntegrations(data)
      // Load Slack invite link if exists
      const slackIntegration = data.find(i => i.provider === 'slack')
      if (slackIntegration?.config?.invite_link) {
        setSlackInviteLink(slackIntegration.config.invite_link)
      }
    }

    // Check Mercury and Ramp connection status (use API keys, not just DB)
    try {
      const [mercuryRes, rampRes] = await Promise.all([
        fetch('/api/integrations/mercury/status'),
        fetch('/api/integrations/ramp/status'),
      ])
      const mercuryStatus = await mercuryRes.json()
      const rampStatus = await rampRes.json()
      setMercuryConnected(mercuryStatus.connected)
      setRampConnected(rampStatus.connected)
    } catch {
      setMercuryConnected(false)
      setRampConnected(false)
    }

    setLoading(false)
  }

  async function saveSlackInviteLink() {
    const slackIntegration = integrations.find(i => i.provider === 'slack')
    if (!slackIntegration) return

    setSavingSlackLink(true)
    const { error } = await supabase
      .from('integrations')
      .update({
        config: { ...slackIntegration.config, invite_link: slackInviteLink }
      })
      .eq('id', slackIntegration.id)

    if (!error) {
      setMessage({ type: 'success', text: 'Slack invite link saved!' })
      fetchIntegrations()
    } else {
      setMessage({ type: 'error', text: 'Failed to save invite link' })
    }
    setSavingSlackLink(false)
  }

  function isConnected(provider: IntegrationProvider): boolean {
    // Mercury and Ramp use API keys from env, check via status endpoints
    if (provider === 'mercury') {
      return mercuryConnected
    }
    if (provider === 'ramp') {
      return rampConnected
    }
    return integrations.some(i => i.provider === provider && i.is_active)
  }

  function getIntegration(provider: IntegrationProvider): Integration | undefined {
    return integrations.find(i => i.provider === provider)
  }

  // Helper to add integration to selected_integrations for sidebar
  async function addToSelectedIntegrations(provider: string) {
    if (!organizationId) return
    if (selectedIntegrations.includes(provider)) return

    const newSelected = [...selectedIntegrations, provider]
    await supabase
      .from('organizations')
      .update({ selected_integrations: newSelected })
      .eq('id', organizationId)

    setSelectedIntegrations(newSelected)
  }

  async function handleConnect(provider: IntegrationProvider) {
    setConnecting(provider)

    // Providers with real OAuth flows
    const oauthProviders = ['slack', 'github', 'quickbooks', 'deel', 'ramp']

    // Providers that use API keys from environment variables (no OAuth)
    const apiKeyProviders = ['mercury']

    if (oauthProviders.includes(provider)) {
      // Add to selected integrations before redirecting to OAuth
      await addToSelectedIntegrations(provider)
      // Redirect to OAuth flow
      window.location.href = `/api/integrations/${provider}/connect`
    } else if (apiKeyProviders.includes(provider)) {
      // These use API keys - check if already connected, then add to sidebar
      await addToSelectedIntegrations(provider)

      // Check if the API keys are already configured and working
      const statusRes = await fetch(`/api/integrations/${provider}/status`)
      const status = await statusRes.json()

      if (status.connected) {
        setMessage({
          type: 'success',
          text: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`
        })
      } else {
        const envVars = provider === 'mercury'
          ? 'MERCURY_API_KEY'
          : 'RAMP_CLIENT_ID and RAMP_CLIENT_SECRET'
        setMessage({
          type: 'error',
          text: `${provider.charAt(0).toUpperCase() + provider.slice(1)} not configured. Add ${envVars} to your environment variables.`
        })
      }

      fetchIntegrations() // Refresh to check connection status
      setConnecting(null)
    } else {
      // Mock connect for demo - just create an integration record
      if (!organizationId) {
        setConnecting(null)
        return
      }

      await supabase.from('integrations').insert({
        organization_id: organizationId,
        provider,
        access_token: 'mock_token',
        provider_data: { mock: true },
        config: {},
      })

      // Add to selected integrations for sidebar
      await addToSelectedIntegrations(provider)

      setMessage({ type: 'success', text: `${provider} connected successfully!` })
      fetchIntegrations()
      setConnecting(null)
    }
  }

  async function handleDisconnect(provider: IntegrationProvider) {
    const integration = getIntegration(provider)
    if (!integration) return

    if (confirm(`Are you sure you want to disconnect ${provider}?`)) {
      await supabase.from('integrations').delete().eq('id', integration.id)
      fetchIntegrations()
    }
  }

  if (loading) {
    return <div className="p-8">Loading integrations...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect your tools to automate employee onboarding</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Your Selected Integrations */}
      {selectedIntegrations.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Integrations</h2>
            <p className="text-sm text-muted-foreground">Selected during setup - connect these to automate onboarding</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {selectedIntegrations.map((key) => {
              const config = ALL_INTEGRATIONS[key]
              if (!config) return null
              const connected = isConnected(config.provider)
              const integration = getIntegration(config.provider)

              return (
                <IntegrationCard
                  key={config.provider}
                  config={config}
                  connected={connected}
                  integration={integration}
                  connecting={connecting}
                  slackInviteLink={slackInviteLink}
                  setSlackInviteLink={setSlackInviteLink}
                  savingSlackLink={savingSlackLink}
                  saveSlackInviteLink={saveSlackInviteLink}
                  handleConnect={handleConnect}
                  handleDisconnect={handleDisconnect}
                  isSelected
                />
              )
            })}
          </div>
        </>
      )}

      {/* Other Available Integrations */}
      {(() => {
        const otherIntegrations = Object.values(ALL_INTEGRATIONS).filter(
          config => !selectedIntegrations.includes(config.provider)
        )
        if (otherIntegrations.length === 0) return null

        return (
          <>
            <div className="pt-4">
              <h2 className="text-xl font-semibold mb-1">Other Integrations</h2>
              <p className="text-sm text-muted-foreground">Additional tools you can connect</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {otherIntegrations.map((config) => {
                const connected = isConnected(config.provider)
                const integration = getIntegration(config.provider)

                return (
                  <IntegrationCard
                    key={config.provider}
                    config={config}
                    connected={connected}
                    integration={integration}
                    connecting={connecting}
                    slackInviteLink={slackInviteLink}
                    setSlackInviteLink={setSlackInviteLink}
                    savingSlackLink={savingSlackLink}
                    saveSlackInviteLink={saveSlackInviteLink}
                    handleConnect={handleConnect}
                    handleDisconnect={handleDisconnect}
                    isSelected={false}
                  />
                )
              })}
            </div>
          </>
        )
      })()}
    </div>
  )
}

