import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  position: string | null
  department: string | null
  avatar_url: string | null
  manager_id: string | null
}

export default async function OrgChartPage() {
  const supabase = await createClient()

  // Get current user's organization
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  // Fetch team members from the same organization
  const { data: teamMembers } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', currentUser?.organization_id)
    .order('created_at', { ascending: true })

  const members: TeamMember[] = teamMembers || []
  const founders = members.filter(m => m.role === 'founder')
  const employees = members.filter(m => m.role === 'employee')

  // Get unique departments
  const departments = new Set(members.map(m => m.department).filter(Boolean))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
        <p className="text-muted-foreground">
          View your company structure and reporting lines
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.size || 0}</div>
            {departments.size > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.from(departments).map((dept) => (
                  <Badge key={dept} variant="outline" className="text-xs">
                    {dept}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Org Chart - Simple List View */}
      <Card>
        <CardHeader>
          <CardTitle>Company Structure</CardTitle>
          <CardDescription>
            Your organization members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members yet. Share the signup link with your team!
            </p>
          ) : (
            <div className="space-y-6">
              {/* Founders */}
              {founders.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Leadership</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {founders.map((member) => (
                      <div key={member.id} className="flex flex-col items-center p-4 border rounded-lg bg-primary/5 min-w-[150px]">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-center">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.position || 'Founder'}</p>
                        <Badge className="mt-2" variant="default">Founder</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {employees.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Team</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {employees.map((member) => (
                      <div key={member.id} className="flex flex-col items-center p-4 border rounded-lg min-w-[150px]">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-center">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.position || 'Team Member'}</p>
                        {member.department && (
                          <Badge className="mt-2" variant="outline">{member.department}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

