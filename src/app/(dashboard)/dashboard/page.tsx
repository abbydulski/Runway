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
  Flame,
  Receipt,
  Percent,
  Banknote,
  FileText,
} from 'lucide-react'
import { getAllDashboardData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AyerTicketsCard } from '@/components/ayer-tickets'
import { WeeklyTrendsChart } from '@/components/dashboard/weekly-trends-chart'
import { fetchMercuryData, isRampPayment, groupTransactionsByWeek } from '@/lib/integrations/mercury'
import { fetchRampData, groupRampTransactionsByWeek } from '@/lib/integrations/ramp'

// Consistent financial data matching the Financials page
const FINANCIAL_DATA = {
  cashBalance: 847000,
  monthlyBurn: 62000,
  runway: 13.7,
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${amount.toFixed(0)}`
}

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
    { count: successfulProvisions },
    { data: ayerIntegration }
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('invites').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'pending'),
    supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_active', true),
    supabase.from('provisioning_logs').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'success'),
    supabase.from('integrations').select('*').eq('organization_id', orgId).eq('provider', 'ayer').eq('is_active', true).single(),
  ])

  const hasAyer = !!ayerIntegration

  // Fetch Mercury and Ramp data for weekly metrics (8 weeks for trends)
  const [mercuryData8Weeks, rampData8Weeks] = await Promise.all([
    fetchMercuryData(56), // Last 8 weeks (56 days)
    orgId ? fetchRampData(orgId, 56) : null,
  ])

  // Group transactions by week for trends
  const mercuryWeekly = mercuryData8Weeks ? groupTransactionsByWeek(mercuryData8Weeks.transactions, 8) : []
  const rampWeekly = rampData8Weeks ? groupRampTransactionsByWeek(rampData8Weeks.transactions, 8) : []

  // Combine Mercury and Ramp weekly data for trends
  const weeklyTrendsData = mercuryWeekly.map((mercuryWeek, index) => {
    const rampWeek = rampWeekly[index]
    const weeklyBurn = mercuryWeek.spendExcludingRamp + (rampWeek?.spend || 0)
    const weeklyEarn = mercuryWeek.revenue
    return {
      weekLabel: mercuryWeek.weekLabel,
      weeklyBurn,
      weeklyEarn,
      percentPaid: weeklyBurn > 0 ? (weeklyEarn / weeklyBurn) * 100 : 0,
      cashCollected: mercuryWeek.revenue,
    }
  })

  // Get current week metrics (last item in the array)
  const currentWeekData = weeklyTrendsData[weeklyTrendsData.length - 1]

  // Calculate current week metrics
  const mercurySpendExcludingRamp = currentWeekData?.weeklyBurn || 0
  const weeklyBurn = currentWeekData?.weeklyBurn || 0
  const weeklyEarn = currentWeekData?.weeklyEarn || 0
  const percentWeekPaid = currentWeekData?.percentPaid || 0
  const cashCollected = currentWeekData?.cashCollected || 0

  // Check if we have real financial data
  const hasFinancialData = mercuryData8Weeks !== null || rampData8Weeks !== null

  // For bank balance, use the 8-week data
  const mercuryData = mercuryData8Weeks

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your company.
        </p>
      </div>

      {/* Sample Data Warning - only show if no financial integrations */}
      {!hasFinancialData && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Connect your financial accounts</p>
              <p className="text-sm text-yellow-700">
                Connect Mercury and Ramp to see real-time financial metrics
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/integrations">Connect Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Weekly Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className={hasFinancialData ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Burn</CardTitle>
            <Flame className={`h-4 w-4 ${hasFinancialData ? 'text-red-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasFinancialData ? 'text-red-700' : ''}`}>
              {hasFinancialData ? formatCurrency(weeklyBurn) : '--'}
            </div>
            <p className={`text-xs ${hasFinancialData ? 'text-red-600' : 'text-muted-foreground'}`}>
              {hasFinancialData ? 'Ramp + Mercury (no dupes)' : 'Connect Mercury & Ramp'}
            </p>
          </CardContent>
        </Card>

        <Card className={hasFinancialData ? 'border-green-200 bg-green-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earn</CardTitle>
            <Receipt className={`h-4 w-4 ${hasFinancialData ? 'text-green-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasFinancialData ? 'text-green-700' : ''}`}>
              {hasFinancialData ? formatCurrency(weeklyEarn) : '--'}
            </div>
            <p className={`text-xs ${hasFinancialData ? 'text-green-600' : 'text-muted-foreground'}`}>
              {hasFinancialData ? 'Deposits this week' : 'Connect Mercury'}
            </p>
          </CardContent>
        </Card>

        <Card className={hasFinancialData ? (percentWeekPaid >= 100 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50') : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Week Paid</CardTitle>
            <Percent className={`h-4 w-4 ${hasFinancialData ? (percentWeekPaid >= 100 ? 'text-green-600' : 'text-yellow-600') : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasFinancialData ? (percentWeekPaid >= 100 ? 'text-green-700' : 'text-yellow-700') : ''}`}>
              {hasFinancialData ? `${percentWeekPaid.toFixed(0)}%` : '--'}
            </div>
            <p className={`text-xs ${hasFinancialData ? (percentWeekPaid >= 100 ? 'text-green-600' : 'text-yellow-600') : 'text-muted-foreground'}`}>
              {hasFinancialData ? 'Earn / Burn' : 'Connect integrations'}
            </p>
          </CardContent>
        </Card>

        <Card className={hasFinancialData ? 'border-blue-200 bg-blue-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Collected</CardTitle>
            <Banknote className={`h-4 w-4 ${hasFinancialData ? 'text-blue-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasFinancialData ? 'text-blue-700' : ''}`}>
              {hasFinancialData ? formatCurrency(cashCollected) : '--'}
            </div>
            <p className={`text-xs ${hasFinancialData ? 'text-blue-600' : 'text-muted-foreground'}`}>
              {hasFinancialData ? 'This week' : 'Connect Mercury'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AR</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon (QBO)</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Balance & Runway */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={employeeCount || 0}
          description="Team members in your organization"
          icon={Users}
        />
        <MetricCard
          title="Bank Balance"
          value={mercuryData ? formatCurrency(mercuryData.stats.totalBalance) : `$${(FINANCIAL_DATA.cashBalance / 1000).toFixed(0)}k`}
          description={mercuryData ? 'From Mercury' : 'Sample data'}
          icon={Landmark}
        />
        <MetricCard
          title="Monthly Burn"
          value={mercuryData ? formatCurrency(weeklyBurn * 4) : `$${(FINANCIAL_DATA.monthlyBurn / 1000).toFixed(0)}k`}
          description={mercuryData ? 'Estimated from weekly' : 'Sample data'}
          icon={DollarSign}
        />
        <MetricCard
          title="Runway"
          value={mercuryData && weeklyBurn > 0
            ? `${(mercuryData.stats.totalBalance / (weeklyBurn * 4)).toFixed(1)} months`
            : `${FINANCIAL_DATA.runway} months`}
          description="At current burn rate"
          icon={TrendingUp}
        />
      </div>

      {/* Weekly Trends Charts */}
      {hasFinancialData && weeklyTrendsData.length > 0 && (
        <WeeklyTrendsChart data={weeklyTrendsData} />
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RunwayChart
          data={data.quickbooks.pnl}
          bankBalance={mercuryData?.stats.totalBalance || FINANCIAL_DATA.cashBalance}
          monthlyBurn={weeklyBurn > 0 ? weeklyBurn * 4 : FINANCIAL_DATA.monthlyBurn}
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

      {/* Ayer Field Tickets - Only show if Ayer is connected */}
      {hasAyer && (
        <AyerTicketsCard
          title="Field Tickets Overview"
          description="Latest tickets from Ayer field operations"
        />
      )}

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

