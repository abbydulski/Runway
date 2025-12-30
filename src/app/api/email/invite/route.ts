import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, inviteToken, organizationName, position } = await request.json()

    if (!email || !inviteToken || !organizationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const signupUrl = `${appUrl}/join?token=${inviteToken}`

    const { data, error } = await resend.emails.send({
      from: 'Runway <onboarding@resend.dev>',
      to: email,
      subject: `You're invited to join ${organizationName} on Runway`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #000; font-size: 24px; margin: 0;">✈️ Runway</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #111;">You're invited! 🎉</h2>
              <p style="margin: 0 0 15px 0;">
                You've been invited to join <strong>${organizationName}</strong>${position ? ` as a <strong>${position}</strong>` : ''}.
              </p>
              <p style="margin: 0 0 25px 0;">
                Click the button below to create your account and complete your onboarding.
              </p>
              <a href="${signupUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Accept Invite
              </a>
            </div>

            <p style="color: #666; font-size: 14px; text-align: center;">
              If you weren't expecting this invite, you can safely ignore this email.
            </p>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

