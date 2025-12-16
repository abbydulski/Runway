'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send, Check, AlertCircle } from 'lucide-react'

interface Team {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
  position?: string
}

interface InviteFormProps {
  organizationId: string
  organizationName: string
  teams: Team[]
  employees: Employee[]
}

export function InviteForm({ organizationId, organizationName, teams, employees }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('')
  const [teamId, setTeamId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSent(false)

    if (!teamId) {
      setError('Please select a team')
      setIsLoading(false)
      return
    }

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

    // Generate unique invite token
    const inviteToken = crypto.randomUUID()

    // Create invite with team and manager info
    const { error: insertError } = await supabase
      .from('invites')
      .insert({
        email: email.toLowerCase(),
        organization_id: organizationId,
        team_id: teamId,
        manager_id: managerId || null,
        position: position || null,
        status: 'pending',
        invite_token: inviteToken,
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    // Send invite email
    try {
      const emailResponse = await fetch('/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          inviteToken,
          organizationName,
          position: position || null,
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        console.error('Email send error:', errorData)
        // Don't fail the invite if email fails, just log it
      }
    } catch (emailError) {
      console.error('Email send error:', emailError)
    }

    setIsLoading(false)
    setIsSent(true)
    setEmail('')
    setPosition('')
    setTeamId('')
    setManagerId('')
    setTimeout(() => setIsSent(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {teams.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>You need to <a href="/dashboard/teams" className="underline font-medium">create a team</a> before inviting employees.</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position/Role</Label>
          <Input
            id="position"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Team *</Label>
          <select
            id="team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            required
          >
            <option value="">Select a team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager">Reports To</Label>
          <select
            id="manager"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Select manager (optional)...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}{emp.position ? ` - ${emp.position}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          The employee will be automatically added to team integrations (Slack, GitHub, etc.)
        </p>
        <Button type="submit" disabled={isLoading || !email || !teamId || teams.length === 0}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
          ) : isSent ? (
            <><Check className="mr-2 h-4 w-4" /> Sent!</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Send Invite</>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}

