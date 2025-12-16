import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle, XCircle, Clock, Slack, Github } from 'lucide-react'

type ProvisioningLog = {
  id: string
  user_id: string
  provider: string
  action: string
  status: 'pending' | 'success' | 'failed'
  error_message: string | null
  created_at: string
  users: { name: string; email: string } | null
}

const providerIcons: Record<string, React.ReactNode> = {
  slack: <Slack className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
}

export default async function LogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  const { data: logs } = await supabase
    .from('provisioning_logs')
    .select('*, users(name, email)')
    .eq('organization_id', currentUser?.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const provisioningLogs: ProvisioningLog[] = logs || []

  const successCount = provisioningLogs.filter(l => l.status === 'success').length
  const failedCount = provisioningLogs.filter(l => l.status === 'failed').length
  const pendingCount = provisioningLogs.filter(l => l.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provisioning Logs</h1>
        <p className="text-muted-foreground">
          Track all automated onboarding actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 100 provisioning actions</CardDescription>
        </CardHeader>
        <CardContent>
          {provisioningLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No provisioning logs yet. Logs will appear here when employees are onboarded.
            </p>
          ) : (
            <div className="space-y-3">
              {provisioningLogs.map((log) => {
                const status = statusConfig[log.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${status.bg}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border">
                        {providerIcons[log.provider] || <span className="text-xs">{log.provider}</span>}
                      </div>
                      <div>
                        <p className="font-medium">{log.users?.name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{log.action}</p>
                        {log.error_message && (
                          <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <Badge variant="outline" className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

