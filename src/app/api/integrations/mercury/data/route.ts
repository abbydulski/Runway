import { NextResponse } from 'next/server'

const MERCURY_API_URL = 'https://api.mercury.com/api/v1'

interface MercuryAccount {
  id: string
  name: string
  status: string
  type: string
  legalBusinessName: string
  currentBalance: number
  availableBalance: number
  accountNumber: string
  routingNumber: string
  kind: string
}

interface MercuryTransaction {
  id: string
  amount: number
  bankDescription: string
  counterpartyName: string
  createdAt: string
  dashboardLink: string
  details: {
    domesticWireRoutingInfo?: unknown
    electronicRoutingInfo?: unknown
    internationalWireRoutingInfo?: unknown
    address?: unknown
  }
  estimatedDeliveryDate: string
  externalMemo: string
  failedAt: string | null
  kind: string
  note: string
  postedAt: string
  status: string
}

export async function GET() {
  const apiKey = process.env.MERCURY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Mercury API key not configured' }, { status: 400 })
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
  }

  try {
    // Fetch accounts
    const accountsRes = await fetch(`${MERCURY_API_URL}/accounts`, { headers })
    
    if (!accountsRes.ok) {
      const errorText = await accountsRes.text()
      console.error('Mercury accounts error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch Mercury accounts', details: errorText }, { status: accountsRes.status })
    }
    
    const accountsData = await accountsRes.json()
    const accounts: MercuryAccount[] = accountsData.accounts || []

    // Fetch transactions for each account (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    let allTransactions: MercuryTransaction[] = []
    
    for (const account of accounts.slice(0, 3)) { // Limit to first 3 accounts
      const txRes = await fetch(
        `${MERCURY_API_URL}/account/${account.id}/transactions?start=${startDate}&end=${endDate}&limit=50`,
        { headers }
      )
      if (txRes.ok) {
        const txData = await txRes.json()
        allTransactions = [...allTransactions, ...(txData.transactions || [])]
      }
    }

    // Sort transactions by date
    allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate stats
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
    const availableBalance = accounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0)
    
    const monthlySpend = allTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const monthlyRevenue = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate runway (months of runway based on current burn rate)
    const runway = monthlySpend > 0 ? Math.round((totalBalance / monthlySpend) * 10) / 10 : 0

    return NextResponse.json({
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type || acc.kind,
        currentBalance: acc.currentBalance,
        availableBalance: acc.availableBalance,
        status: acc.status,
      })),
      transactions: allTransactions.slice(0, 20).map(tx => ({
        id: tx.id,
        amount: tx.amount,
        description: tx.bankDescription || tx.counterpartyName || tx.note,
        counterparty: tx.counterpartyName,
        date: tx.createdAt,
        status: tx.status,
        type: tx.amount > 0 ? 'credit' : 'debit',
      })),
      stats: {
        totalBalance,
        availableBalance,
        monthlySpend,
        monthlyRevenue,
        runway,
        accountCount: accounts.length,
      },
    })
  } catch (error) {
    console.error('Mercury API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Mercury data' }, { status: 500 })
  }
}

