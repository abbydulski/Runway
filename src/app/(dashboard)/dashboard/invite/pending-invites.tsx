'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface PendingInvite {
  id: string
  email: string
  created_at: string
  position?: string
  invite_token?: string
  teams?: { name: string }
}

interface PendingInvitesProps {
  invites: PendingInvite[]
}

export function PendingInvites({ invites }: PendingInvitesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyInviteLink = async (invite: PendingInvite) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/join?token=${invite.invite_token}`
    await navigator.clipboard.writeText(link)
    setCopiedId(invite.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (invites.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invites</CardTitle>
        <CardDescription>
          Invites that haven&apos;t been accepted yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-muted-foreground">
                  {invite.position && <span>{invite.position} • </span>}
                  {invite.teams?.name && <span>{invite.teams.name} • </span>}
                  Sent {new Date(invite.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {invite.invite_token && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyInviteLink(invite)}
                    className="h-8"
                  >
                    {copiedId === invite.id ? (
                      <><Check className="h-4 w-4 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> Copy Link</>
                    )}
                  </Button>
                )}
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

