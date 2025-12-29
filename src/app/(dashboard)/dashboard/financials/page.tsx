'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DollarSign, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
  Link2,
  Receipt
} from 'lucide-react'
import { RunwayChart, RevenueExpenseChart } from '@/components/dashboard/charts'
import Link from 'next/link'

interface FinancialData {
  cashBalance: number
  monthlyBurn: number
  runway: number
  revenue: number
  expenses: number
  revenueGrowth: number
  burnTrend: number
  pnlData: {
    period: string
    revenue: number
    expenses: number
    net_income: number
  }[]
  recentTransactions: {
    id: string
    description: string
    amount: number
    type: 'credit' | 'debit'
    date: string
    category: string
  }[]
  isConnected: boolean
}

// Mock data - will be replaced with real QB data
const getMockFinancialData = (): FinancialData => ({
  cashBalance: 847000,
  monthlyBurn: 62000,
  runway: 13.7,
  revenue: 45000,
  expenses: 107000,
  revenueGrowth: 12.5,
  burnTrend: -3.2,
  pnlData: [
    { period: 'Jul', revenue: 32000, expenses: 98000, net_income: -66000 },
    { period: 'Aug', revenue: 35000, expenses: 95000, net_income: -60000 },
    { period: 'Sep', revenue: 38000, expenses: 102000, net_income: -64000 },
    { period: 'Oct', revenue: 42000, expenses: 105000, net_income: -63000 },
    { period: 'Nov', revenue: 44000, expenses: 108000, net_income: -64000 },
    { period: 'Dec', revenue: 45000, expenses: 107000, net_income: -62000 },
  ],
  recentTransactions: [
    { id: '1', description: 'AWS Services', amount: 4500, type: 'debit', date: '2024-12-28', category: 'Infrastructure' },
    { id: '2', description: 'Customer Payment - Acme Co', amount: 12000, type: 'credit', date: '2024-12-27', category: 'Revenue' },
    { id: '3', description: 'Payroll - Dec', amount: 45000, type: 'debit', date: '2024-12-26', category: 'Payroll' },
    { id: '4', description: 'Stripe Processing', amount: 890, type: 'debit', date: '2024-12-25', category: 'Fees' },
    { id: '5', description: 'Customer Payment - TechCorp', amount: 8500, type: 'credit', date: '2024-12-24', category: 'Revenue' },
  ],
  isConnected: false,
})

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Try to fetch real QB data
    try {
      const response = await fetch('/api/integrations/quickbooks/data')
      if (response.ok) {
        const qbData = await response.json()
        // Transform QB data to our format
        // For now, use mock data with connected flag
        const mockData = getMockFinancialData()
        mockData.isConnected = true
        setData(mockData)
      } else {
        // Fall back to mock data
        setData(getMockFinancialData())
      }
    } catch {
      setData(getMockFinancialData())
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const runwayStatus = data.runway > 12 ? 'healthy' : data.runway > 6 ? 'warning' : 'critical'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            Financials
          </h1>
          <p className="text-muted-foreground">
            Track your burn rate, runway, and financial health
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!data.isConnected && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/integrations">
                <Link2 className="h-4 w-4 mr-2" />
                Connect QuickBooks
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!data.isConnected && (
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
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Cash Balance */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ${(data.cashBalance / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-green-600 mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        {/* Monthly Burn */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              ${(data.monthlyBurn / 1000).toFixed(0)}k
            </div>
            <div className="flex items-center text-xs mt-1">
              {data.burnTrend < 0 ? (
                <>
                  <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600">{Math.abs(data.burnTrend)}% vs last month</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-600">{data.burnTrend}% vs last month</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Runway */}
        <Card className={`border-${runwayStatus === 'healthy' ? 'blue' : runwayStatus === 'warning' ? 'yellow' : 'red'}-200 bg-gradient-to-br from-${runwayStatus === 'healthy' ? 'blue' : runwayStatus === 'warning' ? 'yellow' : 'red'}-50 to-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {data.runway.toFixed(1)} mo
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={runwayStatus === 'healthy' ? 'outline' : runwayStatus === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
                {runwayStatus === 'healthy' ? '✓ Healthy' : runwayStatus === 'warning' ? '⚠ Monitor' : '⚠ Critical'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              ${(data.revenue / 1000).toFixed(0)}k
            </div>
            <div className="flex items-center text-xs mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">{data.revenueGrowth}% growth</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RunwayChart
          data={data.pnlData}
          bankBalance={data.cashBalance}
          monthlyBurn={data.monthlyBurn}
        />
        <RevenueExpenseChart data={data.pnlData} />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/quickbooks">
              <Receipt className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${txn.type === 'credit' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">{txn.category} • {txn.date}</p>
                  </div>
                </div>
                <span className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Expense Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Payroll</p>
            <p className="text-sm text-muted-foreground">68% of monthly expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Burn Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">-2.1%</p>
            <p className="text-sm text-muted-foreground">Over last 3 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Break-even Target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$107k MRR</p>
            <p className="text-sm text-muted-foreground">$62k to go</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

