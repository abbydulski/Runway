import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrgNode } from '@/components/org-chart/org-node'
import { getOrgChartData } from '@/lib/mock-data'
import { Users, Building2, Globe } from 'lucide-react'

export default async function OrgChartPage() {
  const { orgChart } = await getOrgChartData()

  // Calculate stats from org chart
  const countNodes = (node: typeof orgChart): number => {
    let count = 1
    if (node.children) {
      node.children.forEach((child) => {
        count += countNodes(child)
      })
    }
    return count
  }

  const getDepartments = (node: typeof orgChart): Set<string> => {
    const departments = new Set<string>([node.department])
    if (node.children) {
      node.children.forEach((child) => {
        getDepartments(child).forEach((d) => departments.add(d))
      })
    }
    return departments
  }

  const totalPeople = countNodes(orgChart)
  const departments = getDepartments(orgChart)

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeople}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.size}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(departments).map((dept) => (
                <Badge key={dept} variant="outline" className="text-xs">
                  {dept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              USA, Canada, Spain, UK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Company Structure</CardTitle>
          <CardDescription>
            Click on any team member to view their details
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="flex justify-center py-8 min-w-max">
            <OrgNode node={orgChart} isRoot />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

