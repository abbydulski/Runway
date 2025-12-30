'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface InviteData {
  organization_id: string
  organization_name: string
  email?: string
  position?: string
  team_id?: string
  manager_id?: string
  invite_token?: string
}

function JoinPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get invite token or org ID from URL
  const token = searchParams.get('token')
  const orgId = searchParams.get('org')

  useEffect(() => {
    const loadInviteData = async () => {
      // If we have a token, look up the invite
      if (token) {
        const { data: invite } = await supabase
          .from('invites')
          .select('*, organizations(id, name)')
          .eq('invite_token', token)
          .eq('status', 'pending')
          .single()

        if (invite) {
          const org = Array.isArray(invite.organizations) 
            ? invite.organizations[0] 
            : invite.organizations
          setInviteData({
            organization_id: invite.organization_id,
            organization_name: org?.name || 'Unknown Company',
            email: invite.email,
            position: invite.position,
            team_id: invite.team_id,
            manager_id: invite.manager_id,
            invite_token: token,
          })
          setEmail(invite.email || '')
        } else {
          setError('This invite link is invalid or has already been used.')
        }
      }
      // If we have an org ID, look up the organization
      else if (orgId) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', orgId)
          .single()

        if (org) {
          setInviteData({
            organization_id: org.id,
            organization_name: org.name,
          })
        } else {
          setError('This invite link is invalid.')
        }
      } else {
        setError('No invite token or organization found. Please use a valid invite link.')
      }

      setInitialLoading(false)
    }

    loadInviteData()
  }, [token, orgId, supabase])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteData) return

    setLoading(true)
    setError(null)

    // Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'employee' }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('Please check your email to confirm your account, then log in.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Create user profile as employee
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        role: 'employee',
        organization_id: inviteData.organization_id,
        position: inviteData.position || null,
        team_id: inviteData.team_id || null,
        manager_id: inviteData.manager_id || null,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError(`Failed to create profile: ${profileError.message}`)
        setLoading(false)
        return
      }

      // Mark invite as accepted if we have a token
      if (inviteData.invite_token) {
        await supabase
          .from('invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('invite_token', inviteData.invite_token)
      }

      // Redirect to employee onboarding
      router.push('/onboarding')
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image src="/RunwayLogo.png" alt="Runway" width={32} height={32} />
              <span className="text-2xl font-bold">Runway</span>
            </div>
            <CardTitle className="text-xl text-destructive">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/RunwayLogo.png" alt="Runway" width={32} height={32} />
            <span className="text-2xl font-bold">Runway</span>
          </div>
          <CardTitle className="text-2xl">Join {inviteData?.organization_name}</CardTitle>
          <CardDescription>
            <span className="flex items-center justify-center gap-2 mt-2">
              <Building2 className="h-4 w-4" />
              Create your account to get started
            </span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {inviteData?.position && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                You&apos;re joining as <strong>{inviteData.position}</strong>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!inviteData?.email}
              />
              {inviteData?.email && (
                <p className="text-xs text-muted-foreground">
                  This email was specified in your invite
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Join & Continue'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  )
}
