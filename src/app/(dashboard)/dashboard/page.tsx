import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  DollarSign,
  TrendingUp,
  Landmark,
  GitPullRequest,
  FolderGit2,
  UserPlus,
  Clock,
} from 'lucide-react'
import { getAllDashboardData } from '@/lib/mock-data'

export default async function DashboardPage() {
  const data = await getAllDashboardData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your company.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={data.metrics.totalEmployees}
          description={`${data.deel.stats.contractors} contractors, ${data.deel.stats.fullTimeEmployees} full-time`}
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

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
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

