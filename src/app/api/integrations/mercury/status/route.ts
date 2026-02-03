import { NextResponse } from 'next/server'

const MERCURY_API_URL = 'https://api.mercury.com/api/v1'

export async function GET() {
  const apiKey = process.env.MERCURY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ connected: false, reason: 'No API key configured' })
  }

  try {
    // Try to fetch accounts to verify the API key works
    const res = await fetch(`${MERCURY_API_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ 
        connected: true, 
        accountCount: data.accounts?.length || 0 
      })
    } else {
      return NextResponse.json({ connected: false, reason: 'Invalid API key' })
    }
  } catch (error) {
    console.error('Mercury status check error:', error)
    return NextResponse.json({ connected: false, reason: 'Connection error' })
  }
}

