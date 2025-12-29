'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Building2,
  ArrowRight,
  MessageSquare,
  Github,
  FileText,
  CreditCard,
  Users,
  CheckCircle2,
  Loader2,
  Landmark,
  Layers,
  Key,
  Mail,
  Upload,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'

interface IntegrationOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'communication' | 'development' | 'finance' | 'hr' | 'productivity' | 'security'
  recommended?: boolean
}

const AVAILABLE_INTEGRATIONS: IntegrationOption[] = [
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Auto-invite employees to workspace & channels',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'communication',
    recommended: true,
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Provision email, calendar & Drive access',
    icon: <Mail className="h-5 w-5" />,
    category: 'communication',
    recommended: true,
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    description: 'Provision Outlook, Teams & OneDrive access',
    icon: <Mail className="h-5 w-5" />,
    category: 'communication',
  },
  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Add employees to org & repos automatically',
    icon: <Github className="h-5 w-5" />,
    category: 'development',
    recommended: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Add to teams & projects for issue tracking',
    icon: <Layers className="h-5 w-5" />,
    category: 'development',
  },
  // Finance
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data & track burn rate',
    icon: <FileText className="h-5 w-5" />,
    category: 'finance',
    recommended: true,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    description: 'Connect banking data for cash flow insights',
    icon: <Landmark className="h-5 w-5" />,
    category: 'finance',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Track payments, subscriptions & revenue',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'finance',
  },
  // HR
  {
    id: 'deel',
    name: 'Deel',
    description: 'Manage contracts & payroll for global team',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'hr',
  },
  {
    id: 'gusto',
    name: 'Gusto',
    description: 'US payroll, benefits & HR management',
    icon: <Users className="h-5 w-5" />,
    category: 'hr',
  },
  // Security
  {
    id: 'onepassword',
    name: '1Password',
    description: 'Provision password vault access via SCIM',
    icon: <Key className="h-5 w-5" />,
    category: 'security',
  },
]

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['slack', 'github', 'quickbooks'])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')

  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [skipLogo, setSkipLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id, role, organizations(name, setup_completed)')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'founder') {
        router.push('/employee')
        return
      }

      // Handle organizations as either object or array
      const org = Array.isArray(profile?.organizations)
        ? profile.organizations[0]
        : profile?.organizations

      // If setup already completed, go to dashboard
      if (org?.setup_completed) {
        router.push('/dashboard')
        return
      }

      setOrgId(profile?.organization_id)
      setOrgName(org?.name || '')
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !orgId) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    setUploadingLogo(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${orgId}/logo.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // If bucket doesn't exist, just store a URL reference
      // For now, we'll use data URL as fallback
      setLogoUrl(logoPreview)
      setUploadingLogo(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    setLogoUrl(urlData.publicUrl)
    setUploadingLogo(false)
  }

  const handleLogoStepNext = async () => {
    if (!orgId) return

    // If skip is checked or no logo uploaded, use placeholder
    const finalLogoUrl = skipLogo || !logoUrl ? '/RunwayPlaceholderLogo.png' : logoUrl

    const { error } = await supabase
      .from('organizations')
      .update({ logo_url: finalLogoUrl })
      .eq('id', orgId)

    if (error) {
      console.error('Failed to save logo:', error)
    }

    setStep(3)
  }

  const handleComplete = async () => {
    if (selectedIntegrations.length === 0) {
      return // Don't allow completion without at least one integration
    }

    setSaving(true)

    if (orgId) {
      const { error } = await supabase
        .from('organizations')
        .update({
          setup_completed: true,
          selected_integrations: selectedIntegrations
        })
        .eq('id', orgId)

      if (error) {
        console.error('Failed to update organization:', error)
        alert(`Failed to save: ${error.message}`)
        setSaving(false)
        return
      }
    }

    router.push('/dashboard/integrations?setup=true')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/RunwayLogo.png" alt="Runway" width={32} height={32} />
            <span className="text-xl font-bold">Runway</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {orgName}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Setup Progress</span>
            <span className="font-medium">Step {step} of 3</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to Runway! 🎉</CardTitle>
              <CardDescription className="text-base">
                Let&apos;s set up your workspace for <strong>{orgName}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Here&apos;s what you can do with Runway:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Automate employee onboarding across all your tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Track your burn rate and runway in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage your team structure and org chart
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Invite employees with one click
                  </li>
                </ul>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Company Logo */}
        {step === 2 && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Add Your Company Logo</CardTitle>
              <CardDescription className="text-base">
                Upload your company logo to personalize your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Logo Preview */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-4 border-muted">
                  <AvatarImage src={logoPreview || '/RunwayPlaceholderLogo.png'} alt="Company logo" />
                  <AvatarFallback>
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo || skipLogo}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or SVG. Max 2MB.
                </p>
              </div>

              {/* Skip checkbox */}
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <Checkbox
                  id="skip-logo"
                  checked={skipLogo}
                  onCheckedChange={(checked) => {
                    setSkipLogo(checked === true)
                    if (checked) {
                      setLogoPreview(null)
                      setLogoUrl(null)
                    }
                  }}
                />
                <Label htmlFor="skip-logo" className="text-sm cursor-pointer">
                  Skip this step for now (you can add a logo later in settings)
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleLogoStepNext} className="flex-1" disabled={uploadingLogo}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Integrations */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Integrations</CardTitle>
              <CardDescription>
                Select the tools you want to connect. You can always add or change these later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Communication</h3>
                <div className="space-y-2">
                  {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'communication').map(integration => (
                    <label
                      key={integration.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedIntegrations.includes(integration.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIntegrations.includes(integration.id)}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Development */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Development</h3>
                <div className="space-y-2">
                  {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'development').map(integration => (
                    <label
                      key={integration.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedIntegrations.includes(integration.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIntegrations.includes(integration.id)}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Finance */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Finance</h3>
                <div className="space-y-2">
                  {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'finance').map(integration => (
                    <label
                      key={integration.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedIntegrations.includes(integration.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIntegrations.includes(integration.id)}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* HR */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">HR & Payroll</h3>
                <div className="space-y-2">
                  {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'hr').map(integration => (
                    <label
                      key={integration.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedIntegrations.includes(integration.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIntegrations.includes(integration.id)}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={saving || selectedIntegrations.length === 0}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {selectedIntegrations.length === 0 && (
                <p className="text-sm text-center text-amber-600">
                  Please select at least one integration to continue.
                </p>
              )}

              <p className="text-xs text-center text-muted-foreground">
                You can add more integrations later from your dashboard settings.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

