'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CreditCard, 
  Receipt, 
  Users, 
  DollarSign, 
  RefreshCw,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'

interface RampData {
  business: {
    business_id: string
    business_name: string
  }
  stats: {
    totalSpend: number
    transactionCount: number
    activeCards: number
    totalCards: number
    userCount: number
    pendingReimbursements: number
  }
  transactions: Array<{
    id: string
    amount: number
    merchant: string
    category: string
    date: string
    status: string
    cardHolder: string
  }>
  cards: Array<{
    id: string
    name: string
    lastFour: string
    isActive: boolean
    limit: number | null
    holder: string
  }>
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    status: string
  }>
  reimbursements: Array<{
    id: string
    amount: number
    merchant: string
    date: string
    status: string
    user: string
  }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function RampPage() {
  const [data, setData] = useState<RampData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/integrations/ramp/data')
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to fetch')
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError('Failed to fetch Ramp data')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Ramp
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Ramp
          </h1>
          <p className="text-muted-foreground">Corporate card and expense management</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Required</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Ramp account to see transactions, cards, and expenses.
            </p>
            <Button asChild>
              <Link href="/api/integrations/ramp/connect">
                <CreditCard className="mr-2 h-4 w-4" />
                Connect Ramp
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Ramp
          </h1>
          <p className="text-muted-foreground">
            Corporate card and expense management
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.stats.totalSpend || 0)}</div>
            <p className="text-xs text-muted-foreground">{data?.stats.transactionCount || 0} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.activeCards || 0}</div>
            <p className="text-xs text-muted-foreground">of {data?.stats.totalCards || 0} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.userCount || 0}</div>
            <p className="text-xs text-muted-foreground">With Ramp access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.pendingReimbursements || 0}</div>
            <p className="text-xs text-muted-foreground">Reimbursements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest card transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{tx.merchant || 'Unknown Merchant'}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.cardHolder} • {formatDate(tx.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-{formatCurrency(tx.amount)}</p>
                    <Badge variant="outline" className="text-xs">{tx.status}</Badge>
                  </div>
                </div>
              ))}
              {(!data?.transactions || data.transactions.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cards
            </CardTitle>
            <CardDescription>Active corporate cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.cards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{card.name || `Card •••• ${card.lastFour}`}</p>
                    <p className="text-xs text-muted-foreground">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    {card.limit && <p className="text-sm">{formatCurrency(card.limit)} limit</p>}
                    <Badge variant={card.isActive ? 'default' : 'secondary'}>
                      {card.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!data?.cards || data.cards.length === 0) && (
                <p className="text-sm text-muted-foreground">No cards found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

