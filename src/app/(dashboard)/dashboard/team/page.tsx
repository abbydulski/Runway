import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  position: string | null
  department: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  created_at: string
  team_id: string | null
  teams?: { name: string } | null
}

type ProvisioningLog = {
  user_id: string
  provider: string
  status: 'pending' | 'success' | 'failed'
}

export default async function TeamPage() {
  const supabase = await createClient()

  // Get current user's organization
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  // Fetch team members with their team info
  const { data: teamMembers } = await supabase
    .from('users')
    .select('*, teams(name)')
    .eq('organization_id', currentUser?.organization_id)
    .order('created_at', { ascending: true })

  // Fetch provisioning logs for all users
  const { data: provisioningLogs } = await supabase
    .from('provisioning_logs')
    .select('user_id, provider, status')
    .eq('organization_id', currentUser?.organization_id)

  const members: TeamMember[] = teamMembers || []
  const logs: ProvisioningLog[] = provisioningLogs || []
  const founders = members.filter(m => m.role === 'founder')
  const employees = members.filter(m => m.role === 'employee')

  // Group provisioning logs by user
  const userProvisioningStatus = (userId: string) => {
    const userLogs = logs.filter(l => l.user_id === userId)
    return {
      slack: userLogs.find(l => l.provider === 'slack'),
      github: userLogs.find(l => l.provider === 'github'),
      google_workspace: userLogs.find(l => l.provider === 'google_workspace'),
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and contractors
          </p>
        </div>
        <Link href="/dashboard/invite">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Founders</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{founders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Everyone in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members yet. Share the signup link with your team!
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const provisioning = userProvisioningStatus(member.id)
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={getAvatarUrl(member.avatar_url)}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.teams?.name && (
                          <p className="text-xs text-muted-foreground">Team: {member.teams.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.position || 'No position set'}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Provisioning Status Icons */}
                      {member.role === 'employee' && (
                        <div className="flex items-center gap-1">
                          {provisioning.slack && (
                            <div title={`Slack: ${provisioning.slack.status}`} className="p-1">
                              {provisioning.slack.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : provisioning.slack.status === 'failed' ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <Badge variant={member.role === 'founder' ? 'default' : 'secondary'}>
                        {member.role === 'founder' ? 'Founder' : 'Employee'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={member.onboarding_completed ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}
                      >
                        {member.onboarding_completed ? 'Active' : 'Onboarding'}
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

