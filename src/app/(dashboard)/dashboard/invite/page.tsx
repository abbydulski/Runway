import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Mail } from 'lucide-react'
import { InviteForm } from './invite-form'
import { InviteLinkCard } from './invite-link-card'
import { PendingInvites } from './pending-invites'

export default async function InvitePage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, organizations(id, name)')
    .eq('id', authUser.id)
    .single()

  if (!profile || profile.role !== 'founder') {
    redirect('/dashboard')
  }

  // Get teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .order('name')

  // Get employees for manager selection
  const { data: employees } = await supabase
    .from('users')
    .select('id, name, position')
    .eq('organization_id', profile.organization_id)
    .order('name')

  // Get pending invites with team info
  const { data: invites } = await supabase
    .from('invites')
    .select('*, teams(name)')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const pendingInvites = invites?.filter(i => i.status === 'pending') || []
  const acceptedInvites = invites?.filter(i => i.status === 'accepted') || []

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${baseUrl}/join?org=${profile.organization_id}`

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserPlus className="h-8 w-8" />
          Invite Team Members
        </h1>
        <p className="text-muted-foreground">
          Invite employees to join {profile.organizations?.name}
        </p>
      </div>

      {/* Invite Link Card */}
      <InviteLinkCard inviteLink={inviteLink} orgName={profile.organizations?.name || 'your company'} />

      {/* Email Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email Invite
          </CardTitle>
          <CardDescription>
            Send a personalized invite email to a new team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm
            organizationId={profile.organization_id}
            organizationName={profile.organizations?.name || 'the company'}
            teams={teams || []}
            employees={employees || []}
          />
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <PendingInvites invites={pendingInvites} />

      {/* Accepted Invites */}
      {acceptedInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Accepted Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acceptedInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(invite.accepted_at || invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="default">Accepted</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

