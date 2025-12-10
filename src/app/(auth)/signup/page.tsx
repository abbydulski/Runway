'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User } from 'lucide-react'
import Image from 'next/image'
import { UserRole } from '@/types'

type Organization = {
  id: string
  name: string
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('employee')
  const [companyName, setCompanyName] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
      let orgId = role === 'founder' ? crypto.randomUUID() : selectedOrgId

      // For founders, create the organization first
      if (role === 'founder') {
        const { error: orgError } = await supabase.from('organizations').insert({
          id: orgId,
          name: companyName.trim(),
          founder_id: data.user.id,
          created_at: new Date().toISOString(),
        })
        if (orgError) {
          console.error('Org creation error:', orgError)
          setError(`Failed to create organization: ${orgError.message}`)
          setLoading(false)
          return
        }
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        role,
        organization_id: orgId,
        onboarding_completed: role === 'founder', // Founders skip onboarding
        created_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError(`Failed to create profile: ${profileError.message}`)
        setLoading(false)
        return
      }

      // Success - redirect based on role
      if (role === 'founder') {
        router.push('/dashboard')
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
            <Image src="/logo.svg" alt="Runway" width={32} height={32} />
            <span className="text-2xl font-bold">Runway</span>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Get started with Runway today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Role Selection */}
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

            {/* Employee: Select Company */}
            {role === 'employee' && (
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

