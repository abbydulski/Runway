import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Users, Calendar, FileText, DollarSign, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAvatarUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { AyerTicketsCard, MOCK_AYER_TICKETS } from '@/components/ayer-tickets'

export default async function EmployeeDashboard() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with team info (team_type may not exist yet)
  const { data: profile } = await supabase
    .from('users')
    .select('*, organizations(name, selected_integrations), teams(name)')
    .eq('id', user.id)
    .single()

  // If founder, redirect to dashboard
  if (profile?.role === 'founder') {
    redirect('/dashboard')
  }

  // Get team name from relationship
  const teamData = Array.isArray(profile?.teams) ? profile.teams[0] : profile?.teams
  const teamName = teamData?.name

  // Try to get team_type separately (column may not exist yet)
  let isFieldTeam = false
  if (profile?.team_id) {
    try {
      const { data: teamWithType } = await supabase
        .from('teams')
        .select('team_type')
        .eq('id', profile.team_id)
        .single()
      isFieldTeam = teamWithType?.team_type === 'field'
    } catch {
      // team_type column doesn't exist yet, ignore
    }
  }

  // Check if org has Ayer integration
  const selectedIntegrations = profile?.organizations?.selected_integrations || []
  const hasAyerIntegration = selectedIntegrations.includes('ayer')

  // Show Ayer only for field team members when org has Ayer integration
  const showAyer = isFieldTeam && hasAyerIntegration

  // Get tickets assigned to this user (mock - filter by name for demo)
  const myTickets = MOCK_AYER_TICKETS.filter(t =>
    t.assignee?.toLowerCase().includes(profile?.name?.split(' ')[0]?.toLowerCase() || '')
  )

  const employee = {
    name: profile?.name || 'Team Member',
    email: profile?.email || user.email || '',
    position: profile?.position || 'Team Member',
    department: teamName || profile?.department || 'Not assigned',
    companyName: profile?.organizations?.name || 'Your Company',
    startDate: profile?.created_at || new Date().toISOString(),
    avatar: getAvatarUrl(profile?.avatar_url),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/RunwayLogo.png" alt="Runway" width={24} height={24} />
            <span className="text-xl font-bold">Runway</span>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>
                {employee.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {employee.name}! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s your personal dashboard
          </p>
        </div>

        {/* Ayer Field Tickets - Only for field team members */}
        {showAyer && (
          <div className="mb-6">
            <AyerTicketsCard
              tickets={myTickets.length > 0 ? myTickets : MOCK_AYER_TICKETS.slice(0, 3)}
              title="My Field Tickets"
              description={myTickets.length > 0 ? "Your assigned tickets from Ayer" : "Recent tickets from your team"}
              showAssignee={false}
            />
          </div>
        )}

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl">
                  {employee.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-muted-foreground">{employee.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{employee.position}</Badge>
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{employee.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(employee.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Payment information will be available once Deel integration is connected.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Connect Deel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access important resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Company Handbook</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Time Off Requests</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Pay Stubs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

