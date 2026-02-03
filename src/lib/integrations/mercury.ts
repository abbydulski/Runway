const MERCURY_API_URL = 'https://api.mercury.com/api/v1'

export interface MercuryAccount {
  id: string
  name: string
  status: string
  type: string
  currentBalance: number
  availableBalance: number
}

export interface MercuryTransaction {
  id: string
  amount: number
  bankDescription: string
  counterpartyName: string
  createdAt: string
  status: string
  kind: string
}

export interface MercuryData {
  accounts: MercuryAccount[]
  transactions: MercuryTransaction[]
  stats: {
    totalBalance: number
    availableBalance: number
    weeklySpend: number
    weeklyRevenue: number
    accountCount: number
  }
}

export async function fetchMercuryData(days: number = 7): Promise<MercuryData | null> {
  const apiKey = process.env.MERCURY_API_KEY

  if (!apiKey) {
    return null
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
  }

  try {
    // Fetch accounts
    const accountsRes = await fetch(`${MERCURY_API_URL}/accounts`, { headers, cache: 'no-store' })
    
    if (!accountsRes.ok) {
      console.error('Mercury accounts error:', await accountsRes.text())
      return null
    }
    
    const accountsData = await accountsRes.json()
    const accounts = accountsData.accounts || []

    // Fetch transactions for the specified period
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = new Date().toISOString().split('T')[0]

    let allTransactions: MercuryTransaction[] = []
    
    for (const account of accounts.slice(0, 3)) {
      const txRes = await fetch(
        `${MERCURY_API_URL}/account/${account.id}/transactions?start=${startDateStr}&end=${endDateStr}&limit=100`,
        { headers, cache: 'no-store' }
      )
      if (txRes.ok) {
        const txData = await txRes.json()
        allTransactions = [...allTransactions, ...(txData.transactions || [])]
      }
    }

    // Sort by date
    allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate stats
    const totalBalance = accounts.reduce((sum: number, acc: MercuryAccount) => sum + (acc.currentBalance || 0), 0)
    const availableBalance = accounts.reduce((sum: number, acc: MercuryAccount) => sum + (acc.availableBalance || 0), 0)
    
    const weeklySpend = allTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const weeklyRevenue = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      accounts,
      transactions: allTransactions,
      stats: {
        totalBalance,
        availableBalance,
        weeklySpend,
        weeklyRevenue,
        accountCount: accounts.length,
      },
    }
  } catch (error) {
    console.error('Mercury fetch error:', error)
    return null
  }
}

// Check if a Mercury transaction is a payment to Ramp (to avoid double counting)
export function isRampPayment(transaction: MercuryTransaction): boolean {
  const counterparty = (transaction.counterpartyName || '').toLowerCase()
  const description = (transaction.bankDescription || '').toLowerCase()

  return counterparty.includes('ramp') ||
         description.includes('ramp') ||
         counterparty.includes('ramp financial') ||
         description.includes('ramp financial')
}

// Get the start of the week (Sunday) for a given date
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export interface WeeklyMetrics {
  weekStart: string
  weekLabel: string
  spend: number
  spendExcludingRamp: number
  revenue: number
}

export function groupTransactionsByWeek(transactions: MercuryTransaction[], weeks: number = 8): WeeklyMetrics[] {
  const weekMap = new Map<string, WeeklyMetrics>()

  // Initialize weeks
  const now = new Date()
  for (let i = 0; i < weeks; i++) {
    const weekDate = new Date(now)
    weekDate.setDate(weekDate.getDate() - (i * 7))
    const weekStart = getWeekStart(weekDate)
    const weekLabel = new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    weekMap.set(weekStart, {
      weekStart,
      weekLabel,
      spend: 0,
      spendExcludingRamp: 0,
      revenue: 0,
    })
  }

  // Group transactions
  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt)
    const weekStart = getWeekStart(txDate)

    const week = weekMap.get(weekStart)
    if (week) {
      if (tx.amount < 0) {
        week.spend += Math.abs(tx.amount)
        if (!isRampPayment(tx)) {
          week.spendExcludingRamp += Math.abs(tx.amount)
        }
      } else {
        week.revenue += tx.amount
      }
    }
  }

  // Convert to array and sort by date (oldest first for charts)
  return Array.from(weekMap.values()).sort((a, b) =>
    new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  )
}

