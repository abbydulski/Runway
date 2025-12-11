'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send, Check } from 'lucide-react'

interface InviteFormProps {
  organizationId: string
}

export function InviteForm({ organizationId }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSent(false)

    const supabase = createClient()

    // Check if invite already exists
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('organization_id', organizationId)
      .single()

    if (existingInvite) {
      setError('An invite has already been sent to this email')
      setIsLoading(false)
      return
    }

    // Create invite
    const { error: insertError } = await supabase
      .from('invites')
      .insert({
        email: email.toLowerCase(),
        organization_id: organizationId,
        status: 'pending',
      })

    setIsLoading(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      setIsSent(true)
      setEmail('')
      setTimeout(() => setIsSent(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
          <Button type="submit" disabled={isLoading || !email}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : isSent ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Invite
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: In this demo, no actual email is sent. The invite is recorded and the user can sign up using the invite link.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}

