import { createClient } from '@/lib/supabase/server'

const RAMP_API_URL = 'https://api.ramp.com/developer/v1'

export interface RampTransaction {
  id: string
  amount: number // in cents
  merchant_name: string
  merchant_category_code_description: string
  user_transaction_time: string
  state: string
  card_holder?: { first_name: string; last_name: string }
}

export interface RampData {
  transactions: RampTransaction[]
  stats: {
    weeklySpend: number
    transactionCount: number
  }
}

export interface RampWeeklyMetrics {
  weekStart: string
  weekLabel: string
  spend: number
}

// Get the start of the week (Sunday) for a given date
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export function groupRampTransactionsByWeek(transactions: RampTransaction[], weeks: number = 8): RampWeeklyMetrics[] {
  const weekMap = new Map<string, RampWeeklyMetrics>()

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
    })
  }

  // Group transactions (Ramp amounts are in cents)
  for (const tx of transactions) {
    const txDate = new Date(tx.user_transaction_time)
    const weekStart = getWeekStart(txDate)

    const week = weekMap.get(weekStart)
    if (week) {
      week.spend += (tx.amount || 0) / 100 // Convert cents to dollars
    }
  }

  // Convert to array and sort by date (oldest first for charts)
  return Array.from(weekMap.values()).sort((a, b) =>
    new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  )
}

export async function fetchRampData(orgId: string, days: number = 7): Promise<RampData | null> {
  const supabase = await createClient()

  // Get Ramp integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, provider_data')
    .eq('organization_id', orgId)
    .eq('provider', 'ramp')
    .single()

  if (!integration?.access_token) {
    return null
  }

  const headers = {
    'Authorization': `Bearer ${integration.access_token}`,
    'Accept': 'application/json',
  }

  try {
    // Calculate date range for filtering
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch transactions
    const txRes = await fetch(`${RAMP_API_URL}/transactions?page_size=100`, { 
      headers,
      cache: 'no-store'
    })
    
    if (!txRes.ok) {
      console.error('Ramp transactions error:', await txRes.text())
      return null
    }

    const txData = await txRes.json()
    const allTransactions: RampTransaction[] = txData.data || []

    // Filter to transactions within the date range
    const recentTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.user_transaction_time)
      return txDate >= startDate
    })

    // Calculate weekly spend (Ramp amounts are in cents)
    const weeklySpend = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / 100

    return {
      transactions: recentTransactions,
      stats: {
        weeklySpend,
        transactionCount: recentTransactions.length,
      },
    }
  } catch (error) {
    console.error('Ramp fetch error:', error)
    return null
  }
}

