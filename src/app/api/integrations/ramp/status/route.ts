import { NextResponse } from 'next/server'

const RAMP_API_URL = 'https://api.ramp.com/developer/v1'

export async function GET() {
  const clientId = process.env.RAMP_CLIENT_ID
  const clientSecret = process.env.RAMP_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ connected: false, reason: 'No Ramp credentials configured' })
  }

  try {
    // Try to get an access token using client credentials
    // This verifies the credentials are valid
    const tokenRes = await fetch('https://api.ramp.com/developer/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'transactions:read cards:read users:read business:read',
      }),
    })

    if (tokenRes.ok) {
      return NextResponse.json({ connected: true })
    } else {
      const error = await tokenRes.text()
      console.error('Ramp token error:', error)
      return NextResponse.json({ connected: false, reason: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Ramp status check error:', error)
    return NextResponse.json({ connected: false, reason: 'Connection error' })
  }
}

