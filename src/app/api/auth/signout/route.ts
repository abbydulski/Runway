import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Get the origin from the request to handle both localhost and Vercel
  const origin = request.headers.get('origin') || request.nextUrl.origin

  return NextResponse.redirect(new URL('/login', origin), {
    status: 302,
  })
}

