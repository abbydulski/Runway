import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// QuickBooks API base URLs
const QB_SANDBOX_URL = 'https://sandbox-quickbooks.api.intuit.com'
const QB_PRODUCTION_URL = 'https://quickbooks.api.intuit.com'

async function refreshTokenIfNeeded(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, integration: { id: string; refresh_token: string; token_expires_at: string | null }) {
  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null
  const now = new Date()
  
  // Refresh if expires in less than 5 minutes
  if (expiresAt && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID!
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refresh_token,
      }),
    })

    const tokenData = await response.json()
    
    if (!tokenData.error) {
      await supabase
        .from('integrations')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        })
        .eq('id', integration.id)
      
      return tokenData.access_token
    }
  }
  
  return null
}

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

  if (!profile) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 })
  }

  // Get QuickBooks integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'quickbooks')
    .eq('is_active', true)
    .single()

  if (!integration) {
    return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 })
  }

  // Check if we need to refresh the token
  const accessToken = await refreshTokenIfNeeded(supabase, integration) || integration.access_token
  const realmId = integration.provider_data?.realm_id

  if (!realmId) {
    return NextResponse.json({ error: 'Missing QuickBooks realm ID' }, { status: 400 })
  }

  const isSandbox = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
  const apiBase = isSandbox ? QB_SANDBOX_URL : QB_PRODUCTION_URL

  try {
    // Fetch Company Info
    const companyResponse = await fetch(
      `${apiBase}/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )
    const companyData = await companyResponse.json()

    // Fetch Profit and Loss Report
    const today = new Date()
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1)
    const startDate = sixMonthsAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    const pnlResponse = await fetch(
      `${apiBase}/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )
    const pnlData = await pnlResponse.json()

    // Fetch Account Balances (for cash balance)
    const balanceResponse = await fetch(
      `${apiBase}/v3/company/${realmId}/reports/BalanceSheet?date=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )
    const balanceData = await balanceResponse.json()

    return NextResponse.json({
      company: companyData.CompanyInfo,
      profitAndLoss: pnlData,
      balanceSheet: balanceData,
    })
  } catch (err) {
    console.error('QuickBooks API error:', err)
    return NextResponse.json({ error: 'Failed to fetch QuickBooks data' }, { status: 500 })
  }
}

