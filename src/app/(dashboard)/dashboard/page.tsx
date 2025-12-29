import { MetricCard } from '@/components/dashboard/metric-card'
import { RunwayChart, RevenueExpenseChart, TeamCompositionChart } from '@/components/dashboard/charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  TrendingUp,
  Landmark,
  GitPullRequest,
  FolderGit2,
  UserPlus,
  Clock,
  Link2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { getAllDashboardData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const data = await getAllDashboardData()
  const supabase = await createClient()

  // Get real stats from database
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('organization_id, organizations(name)')
    .eq('id', user?.id)
    .single()

  const orgId = currentUser?.organization_id

  const [
    { count: teamCount },
    { count: employeeCount },
    { count: pendingInvites },
    { count: integrationsCount },
    { count: successfulProvisions }
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('invites').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'pending'),
    supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_active', true),
    supabase.from('provisioning_logs').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'success'),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your company.
        </p>
      </div>

      {/* Sample Data Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-4 py-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Using sample data</p>
            <p className="text-sm text-yellow-700">
              Connect QuickBooks to see your real financial data
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/integrations">Connect Now</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Platform Stats - Real Data */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{employeeCount || 0}</div>
            <p className="text-xs text-green-600">{teamCount || 0} teams</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Link2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{integrationsCount || 0}</div>
            <p className="text-xs text-blue-600">connected</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <UserPlus className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{pendingInvites || 0}</div>
            <p className="text-xs text-yellow-600">awaiting signup</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automations Run</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{successfulProvisions || 0}</div>
            <p className="text-xs text-purple-600">successful provisions</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={employeeCount || 0}
          description="Team members in your organization"
          icon={Users}
        />
        <MetricCard
          title="Bank Balance"
          value={`$${(data.metrics.bankBalance / 1000).toFixed(0)}k`}
          description="Across all accounts"
          icon={Landmark}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Monthly Burn"
          value={`$${(data.metrics.monthlyBurn / 1000).toFixed(0)}k`}
          description="Operating expenses"
          icon={DollarSign}
        />
        <MetricCard
          title="Runway"
          value={`${data.metrics.runway} months`}
          description="At current burn rate"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RunwayChart
          data={data.quickbooks.pnl}
          bankBalance={data.metrics.bankBalance}
          monthlyBurn={data.metrics.monthlyBurn}
        />
        <RevenueExpenseChart data={data.quickbooks.pnl} />
      </div>

      {/* Secondary Metrics + Team Chart */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value={data.metrics.activeProjects}
          icon={FolderGit2}
        />
        <MetricCard
          title="Open PRs"
          value={data.metrics.openPRs}
          icon={GitPullRequest}
        />
        <MetricCard
          title="Pending Onboarding"
          value={data.metrics.pendingOnboarding}
          icon={UserPlus}
        />
        <TeamCompositionChart
          contractors={data.deel.stats.contractors}
          fullTime={data.deel.stats.fullTimeEmployees}
          pending={data.deel.stats.pendingOnboarding}
        />
      </div>

      {/* Activity Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest commits from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.github.commits.slice(0, 5).map((commit) => (
                <div key={commit.sha} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commit.author_avatar} />
                    <AvatarFallback>{commit.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {commit.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {commit.author} • {commit.repo}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {commit.sha.slice(0, 7)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest from Mercury</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.mercury.transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        txn.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.category}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open PRs */}
      <Card>
        <CardHeader>
          <CardTitle>Open Pull Requests</CardTitle>
          <CardDescription>PRs awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.github.prs
              .filter((pr) => pr.state === 'open')
              .map((pr) => (
                <div key={pr.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={pr.author_avatar} />
                      <AvatarFallback>{pr.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {pr.author} • {pr.repo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

