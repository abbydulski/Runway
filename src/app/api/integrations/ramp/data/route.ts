import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const RAMP_API_URL = 'https://api.ramp.com/developer/v1'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 })
  }

  // Get Ramp integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, provider_data')
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'ramp')
    .single()

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Ramp not connected' }, { status: 400 })
  }

  const headers = {
    'Authorization': `Bearer ${integration.access_token}`,
    'Accept': 'application/json',
  }

  try {
    // Fetch transactions
    const txRes = await fetch(`${RAMP_API_URL}/transactions?page_size=50`, { headers })
    const txData = await txRes.json()
    const transactions = txData.data || []

    // Fetch cards
    const cardsRes = await fetch(`${RAMP_API_URL}/cards?page_size=50`, { headers })
    const cardsData = await cardsRes.json()
    const cards = cardsData.data || []

    // Fetch users
    const usersRes = await fetch(`${RAMP_API_URL}/users?page_size=50`, { headers })
    const usersData = await usersRes.json()
    const users = usersData.data || []

    // Fetch reimbursements
    const reimbRes = await fetch(`${RAMP_API_URL}/reimbursements?page_size=20`, { headers })
    const reimbData = await reimbRes.json()
    const reimbursements = reimbData.data || []

    // Calculate stats
    const totalSpend = transactions.reduce((sum: number, tx: { amount: number }) => sum + (tx.amount || 0), 0)
    const activeCards = cards.filter((c: { is_activated: boolean }) => c.is_activated).length
    const pendingReimbursements = reimbursements.filter((r: { status: string }) => r.status === 'PENDING').length

    return NextResponse.json({
      business: integration.provider_data,
      stats: {
        totalSpend: totalSpend / 100, // Ramp uses cents
        transactionCount: transactions.length,
        activeCards,
        totalCards: cards.length,
        userCount: users.length,
        pendingReimbursements,
      },
      transactions: transactions.slice(0, 15).map((tx: {
        id: string
        amount: number
        merchant_name: string
        merchant_category_code_description: string
        user_transaction_time: string
        state: string
        card_holder: { first_name: string; last_name: string }
      }) => ({
        id: tx.id,
        amount: tx.amount / 100,
        merchant: tx.merchant_name,
        category: tx.merchant_category_code_description,
        date: tx.user_transaction_time,
        status: tx.state,
        cardHolder: tx.card_holder ? `${tx.card_holder.first_name} ${tx.card_holder.last_name}` : 'Unknown',
      })),
      cards: cards.slice(0, 10).map((card: {
        id: string
        display_name: string
        last_four: string
        is_activated: boolean
        spending_restrictions: { amount: number }
        card_holder: { first_name: string; last_name: string }
      }) => ({
        id: card.id,
        name: card.display_name,
        lastFour: card.last_four,
        isActive: card.is_activated,
        limit: card.spending_restrictions?.amount ? card.spending_restrictions.amount / 100 : null,
        holder: card.card_holder ? `${card.card_holder.first_name} ${card.card_holder.last_name}` : 'Unknown',
      })),
      users: users.slice(0, 10).map((u: {
        id: string
        first_name: string
        last_name: string
        email: string
        role: string
        status: string
      }) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        role: u.role,
        status: u.status,
      })),
      reimbursements: reimbursements.slice(0, 5).map((r: {
        id: string
        amount: number
        merchant: string
        created_at: string
        status: string
        user: { first_name: string; last_name: string }
      }) => ({
        id: r.id,
        amount: r.amount / 100,
        merchant: r.merchant,
        date: r.created_at,
        status: r.status,
        user: r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Unknown',
      })),
    })
  } catch (error) {
    console.error('Ramp API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Ramp data' }, { status: 500 })
  }
}

