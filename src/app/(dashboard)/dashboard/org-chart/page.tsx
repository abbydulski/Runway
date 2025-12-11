import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrgNode } from '@/components/org-chart/org-node'
import { OrgChartNode } from '@/types'

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

function buildOrgTree(members: TeamMember[]): OrgChartNode[] {
  // Group by department first, with founders at top
  const founders = members.filter(m => m.role === 'founder')
  const employees = members.filter(m => m.role === 'employee')

  // Build tree: founders at root, employees as children
  return founders.map(founder => ({
    id: founder.id,
    name: founder.name,
    position: founder.position || 'Founder',
    department: founder.department || 'Leadership',
    avatar_url: founder.avatar_url || undefined,
    manager_id: undefined,
    children: employees
      .filter(e => e.manager_id === founder.id || !e.manager_id)
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position || 'Team Member',
        department: emp.department || 'General',
        avatar_url: emp.avatar_url || undefined,
        manager_id: emp.manager_id || undefined,
        children: [],
      }))
  }))
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
  const orgTree = buildOrgTree(members)

  // Get unique departments
  const departments = new Set(members.map(m => m.department).filter(Boolean))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
        <p className="text-muted-foreground">
          View your company structure and reporting lines. Click on any person to see details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Founders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.role === 'founder').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.size || 1}</div>
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

      {/* Org Chart - Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Company Structure</CardTitle>
          <CardDescription>
            Click on any team member to view their profile
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members yet. Share the signup link with your team!
            </p>
          ) : (
            <div className="flex justify-center py-8 min-w-fit">
              <div className="flex gap-12">
                {orgTree.map((node) => (
                  <OrgNode key={node.id} node={node} isRoot />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

