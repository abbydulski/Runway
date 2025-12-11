'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link as LinkIcon, Copy, Check } from 'lucide-react'

interface InviteLinkCardProps {
  inviteLink: string
  orgName: string
}

export function InviteLinkCard({ inviteLink, orgName }: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Shareable Invite Link
        </CardTitle>
        <CardDescription>
          Share this link with anyone you want to invite to {orgName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={inviteLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button onClick={handleCopy} variant="outline">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Anyone with this link can sign up as an employee of your company
        </p>
      </CardContent>
    </Card>
  )
}

