'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { UserRole } from '@/types'

type Organization = {
  id: string
  name: string
}

type InviteData = {
  id: string
  email: string
  organization_id: string
  team_id: string | null
  manager_id: string | null
  position: string | null
  organizations: { name: string }
  teams: { name: string } | null
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('employee')
  const [companyName, setCompanyName] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [managerId, setManagerId] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingInvite, setLoadingInvite] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for invite token
  useEffect(() => {
    const checkInvite = async () => {
      const token = searchParams.get('token')
      const orgParam = searchParams.get('org')

      if (token) {
        const { data: inviteData } = await supabase
          .from('invites')
          .select('*, organizations(name), teams(name)')
          .eq('invite_token', token)
          .eq('status', 'pending')
          .single()

        if (inviteData) {
          setInvite(inviteData)
          setEmail(inviteData.email)
          setSelectedOrgId(inviteData.organization_id)
          setTeamId(inviteData.team_id)
          setManagerId(inviteData.manager_id)
          if (inviteData.position) setPosition(inviteData.position)
          setRole('employee')
        }
      } else if (orgParam) {
        setSelectedOrgId(orgParam)
        setRole('employee')
      }

      setLoadingInvite(false)
    }

    checkInvite()
  }, [searchParams, supabase])

  // Fetch organizations for employee dropdown
  useEffect(() => {
    const fetchOrgs = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')
      if (data) setOrganizations(data)
    }
    fetchOrgs()
  }, [supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (role === 'founder' && !companyName.trim()) {
      setError('Please enter your company name')
      setLoading(false)
      return
    }
    if (role === 'employee' && !selectedOrgId) {
      setError('Please select your company')
      setLoading(false)
      return
    }
    if (role === 'employee' && !position.trim()) {
      setError('Please enter your position/role')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Check if we have a session (email confirmation disabled = auto session)
    if (!data.session) {
      // No session means email confirmation is still enabled or something went wrong
      setError('Please check your email to confirm your account, then log in.')
      setLoading(false)
      return
    }

    if (data.user) {
      console.log('DEBUG: Auth user created:', data.user.id)
      let orgId = role === 'founder' ? crypto.randomUUID() : selectedOrgId

      // For founders, create the organization first
      if (role === 'founder') {
        console.log('DEBUG: Creating org with id:', orgId)
        const { data: orgData, error: orgError } = await supabase.from('organizations').insert({
          id: orgId,
          name: companyName.trim(),
          founder_id: data.user.id,
          created_at: new Date().toISOString(),
        }).select()
        console.log('DEBUG: Org insert result:', { orgData, orgError })
        if (orgError) {
          console.error('Org creation error:', orgError)
          setError(`Failed to create organization: ${orgError.message}`)
          setLoading(false)
          return
        }
      }

      // Create user profile
      console.log('DEBUG: Creating user profile')
      const { data: profileData, error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        role,
        organization_id: orgId,
        position: role === 'employee' ? position.trim() : 'Founder',
        department: role === 'employee' && department.trim() ? department.trim() : null,
        team_id: teamId,
        manager_id: managerId,
        onboarding_completed: role === 'founder', // Founders skip onboarding
        created_at: new Date().toISOString(),
      }).select()
      console.log('DEBUG: Profile insert result:', { profileData, profileError })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError(`Failed to create profile: ${profileError.message}`)
        setLoading(false)
        return
      }

      // If signing up via invite, mark it as accepted
      if (invite) {
        await supabase
          .from('invites')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', invite.id)

        // Trigger provisioning (call API to provision integrations)
        try {
          await fetch('/api/provisioning/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: data.user.id,
              organization_id: orgId,
              team_id: teamId,
            }),
          })
        } catch (e) {
          console.error('Provisioning trigger failed:', e)
          // Don't block signup if provisioning fails
        }
      }

      // Success - redirect based on role
      if (role === 'founder') {
        router.push('/setup') // New founder setup wizard
      } else {
        router.push('/onboarding')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.svg" alt="ASC" width={32} height={32} />
            <span className="text-2xl font-bold">ASC</span>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Get started with ASC today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Show invite info if signing up via invite */}
            {invite && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You&apos;ve been invited!</span>
                </div>
                <p className="text-sm text-green-700">
                  Join <strong>{invite.organizations?.name}</strong>
                  {invite.teams?.name && <> as part of the <strong>{invite.teams.name}</strong> team</>}
                  {invite.position && <> as <strong>{invite.position}</strong></>}
                </p>
              </div>
            )}

            {/* Role Selection - only show if not from invite */}
            {!invite && (
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('founder')}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      role === 'founder'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="font-medium">Founder</span>
                    <span className="text-xs text-muted-foreground">Full access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      role === 'employee'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-medium">Employee</span>
                    <span className="text-xs text-muted-foreground">Team member</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Founder: Company Name */}
            {role === 'founder' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Employee: Select Company - only show if not from invite */}
            {role === 'employee' && (
              <>
                {!invite && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Select Your Company</Label>
                    <select
                      id="organization"
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      required
                    >
                      <option value="">Choose a company...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    {organizations.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No companies registered yet. Ask your founder to sign up first.
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="position">Your Position/Role *</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="e.g. Software Engineer, Product Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    disabled={!!invite?.position}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (optional)</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g. Engineering, Marketing, Sales"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
              {loading ? 'Creating account...' : 'Create Account'}
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

