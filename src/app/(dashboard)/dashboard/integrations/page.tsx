'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import type { Integration, IntegrationProvider } from '@/types'

interface IntegrationConfig {
  provider: IntegrationProvider
  name: string
  description: string
  icon: string
  color: string
  docsUrl: string
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Invite employees to your Slack workspace and add them to team channels automatically.',
    icon: '💬',
    color: 'bg-purple-500',
    docsUrl: 'https://api.slack.com/apps',
  },
  {
    provider: 'github',
    name: 'GitHub',
    description: 'Add employees to your GitHub organization and assign them to the right teams.',
    icon: '🐙',
    color: 'bg-gray-800',
    docsUrl: 'https://github.com/settings/apps',
  },
  {
    provider: 'deel',
    name: 'Deel',
    description: 'Automatically create contractor or employee contracts for new hires.',
    icon: '💼',
    color: 'bg-blue-600',
    docsUrl: 'https://developer.deel.com/',
  },
  {
    provider: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync employee data with QuickBooks for payroll and expense tracking.',
    icon: '📊',
    color: 'bg-green-600',
    docsUrl: 'https://developer.intuit.com/',
  },
]

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading integrations...</div>}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
    
    if (!error && data) {
      setIntegrations(data)
    }
    setLoading(false)
  }

  function isConnected(provider: IntegrationProvider): boolean {
    return integrations.some(i => i.provider === provider && i.is_active)
  }

  function getIntegration(provider: IntegrationProvider): Integration | undefined {
    return integrations.find(i => i.provider === provider)
  }

  async function handleConnect(provider: IntegrationProvider) {
    setConnecting(provider)
    
    // Redirect to OAuth flow (we'll implement these endpoints)
    window.location.href = `/api/integrations/${provider}/connect`
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

      <div className="grid gap-6 md:grid-cols-2">
        {INTEGRATIONS.map((config) => {
          const connected = isConnected(config.provider)
          const integration = getIntegration(config.provider)
          
          return (
            <Card key={config.provider} className={connected ? 'border-green-200 bg-green-50/50' : ''}>
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">More integrations coming soon: Google Workspace, Notion, Linear...</p>
        </CardContent>
      </Card>
    </div>
  )
}

