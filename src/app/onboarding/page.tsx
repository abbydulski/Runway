'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  Github,
  Mail,
  FileText,
  Users,
  BookOpen,
  ExternalLink,
  Loader2,
  ChevronRight,
  Download,
  Eye,
  FileSignature
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface OnboardingStep {
  id: string
  title: string
  description: string
  step_type: 'integration' | 'document' | 'manual'
  integration_provider?: string
  document_url?: string
  required: boolean
  step_order: number
}

interface StepProgress {
  step_id: string
  completed: boolean
}

// Get icon for step type
function getStepIcon(step: OnboardingStep) {
  if (step.integration_provider === 'slack') return <MessageSquare className="h-5 w-5" />
  if (step.integration_provider === 'github') return <Github className="h-5 w-5" />
  if (step.integration_provider === 'google_workspace') return <Mail className="h-5 w-5" />
  if (step.step_type === 'document') return <FileText className="h-5 w-5" />
  if (step.title.toLowerCase().includes('handbook')) return <BookOpen className="h-5 w-5" />
  return <Users className="h-5 w-5" />
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [progress, setProgress] = useState<StepProgress[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [handbookUrl, setHandbookUrl] = useState<string | null>(null)
  const [slackInviteLink, setSlackInviteLink] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(false)
  const [companyName, setCompanyName] = useState('')

  // Document viewing state
  const [documentViewed, setDocumentViewed] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [showingDocument, setShowingDocument] = useState(false)

  useEffect(() => {
    const loadOnboardingData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*, teams(slack_config)')
        .eq('id', user.id)
        .single()

      // Founders skip onboarding
      if (profile?.role === 'founder') {
        router.push('/dashboard')
        return
      }

      // Already completed onboarding
      if (profile?.onboarding_completed) {
        router.push('/employee')
        return
      }

      setUserId(user.id)
      setOrgId(profile?.organization_id)
      setTeamId(profile?.team_id)

      if (!profile?.organization_id) {
        setLoading(false)
        return
      }

      // Load organization info (handbook URL, company name)
      const { data: org } = await supabase
        .from('organizations')
        .select('name, handbook_url')
        .eq('id', profile.organization_id)
        .single()

      if (org) {
        setCompanyName(org.name)
        setHandbookUrl(org.handbook_url)
      }

      // Load Slack invite link
      const { data: slackIntegration } = await supabase
        .from('integrations')
        .select('config')
        .eq('organization_id', profile.organization_id)
        .eq('provider', 'slack')
        .single()

      if (slackIntegration?.config?.invite_link) {
        setSlackInviteLink(slackIntegration.config.invite_link)
      }

      // Load onboarding steps configured by founder
      const { data: dbSteps } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_enabled', true)
        .order('step_order')

      if (dbSteps && dbSteps.length > 0) {
        setSteps(dbSteps)
      }

      // Load user's progress
      const { data: dbProgress } = await supabase
        .from('user_onboarding_progress')
        .select('step_id, completed')
        .eq('user_id', user.id)

      if (dbProgress) {
        setProgress(dbProgress)
        // Find first incomplete step
        const completedIds = new Set(dbProgress.filter(p => p.completed).map(p => p.step_id))
        const firstIncomplete = dbSteps?.findIndex(s => !completedIds.has(s.id)) ?? 0
        setCurrentStepIndex(Math.max(0, firstIncomplete))
      }

      setLoading(false)
    }
    loadOnboardingData()
  }, [router, supabase])

  const isStepCompleted = (stepId: string) => {
    return progress.some(p => p.step_id === stepId && p.completed)
  }

  const markStepComplete = async (stepId: string) => {
    if (!userId) return
    setProcessingStep(true)

    // Upsert progress record
    await supabase
      .from('user_onboarding_progress')
      .upsert({
        user_id: userId,
        step_id: stepId,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,step_id' })

    // Update local state
    setProgress(prev => {
      const existing = prev.find(p => p.step_id === stepId)
      if (existing) {
        return prev.map(p => p.step_id === stepId ? { ...p, completed: true } : p)
      }
      return [...prev, { step_id: stepId, completed: true }]
    })

    // Move to next step and reset document viewing state
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      setDocumentViewed(false)
      setAcknowledged(false)
      setShowingDocument(false)
    }

    setProcessingStep(false)
  }

  const handleSlackStep = async (stepId: string) => {
    setProcessingStep(true)

    try {
      await fetch('/api/provisioning/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          organization_id: orgId,
          team_id: teamId,
        }),
      })
    } catch {
      // Continue even if provisioning fails
    }

    await markStepComplete(stepId)
  }

  const handleFinishOnboarding = async () => {
    if (!userId) return

    await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId)

    router.push('/employee')
  }

  const completedCount = progress.filter(p => p.completed).length
  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0
  const currentStep = steps[currentStepIndex]
  const allComplete = steps.length > 0 && completedCount === steps.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <Image src="/RunwayLogo.png" alt="Runway" width={24} height={24} />
            <span className="text-xl font-bold">Runway</span>
          </div>
          <Badge variant="outline">Onboarding</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to {companyName || 'the team'}! 🎉</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s get you set up with all the tools you need
          </p>
        </div>

        {/* Progress Bar */}
        {steps.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount} of {steps.length} steps</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step List */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => {
            const completed = isStepCompleted(step.id)
            const isCurrent = index === currentStepIndex && !allComplete

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  completed
                    ? 'border-green-200 bg-green-50/50'
                    : isCurrent
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'opacity-60'
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${completed ? 'bg-green-100' : isCurrent ? 'bg-primary/10' : 'bg-muted'}`}>
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${completed ? 'text-green-700' : ''}`}>
                          {step.title}
                        </p>
                        {step.required && !completed && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        {completed && (
                          <Badge className="bg-green-500 text-xs">Complete</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {isCurrent && !completed && (
                      <ChevronRight className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Current Step Action Card */}
        {currentStep && !allComplete && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStepIcon(currentStep)}
                {currentStep.title}
              </CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Slack step */}
              {currentStep.integration_provider === 'slack' && slackInviteLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      Click below to join the Slack workspace, then mark this step as complete.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button asChild>
                      <a href={slackInviteLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Slack Invite
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSlackStep(currentStep.id)}
                      disabled={processingStep}
                    >
                      {processingStep ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      I&apos;ve Joined Slack
                    </Button>
                  </div>
                </div>
              ) : currentStep.step_type === 'document' && currentStep.document_url ? (
                <div className="space-y-4">
                  {!showingDocument ? (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          Please review this document carefully before proceeding.
                        </p>
                      </div>
                      <Button onClick={() => { setShowingDocument(true); setDocumentViewed(true); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Inline PDF Viewer */}
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {currentStep.title}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={currentStep.document_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open in new tab
                            </a>
                          </Button>
                        </div>
                        <iframe
                          src={`${currentStep.document_url}#toolbar=0`}
                          className="w-full h-[400px]"
                          title={currentStep.title}
                        />
                      </div>

                      {/* Acknowledgment Section */}
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <FileSignature className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-amber-800">Acknowledgment Required</p>
                            <p className="text-sm text-amber-700 mt-1">
                              By checking the box below, you confirm that you have read and understood this document.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Checkbox
                                id="acknowledge"
                                checked={acknowledged}
                                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                              />
                              <Label htmlFor="acknowledge" className="text-sm text-amber-800 cursor-pointer">
                                I have read and acknowledge this document
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => markStepComplete(currentStep.id)}
                        disabled={processingStep || !acknowledged}
                        className="w-full"
                      >
                        {processingStep ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {acknowledged ? 'Continue to Next Step' : 'Please acknowledge the document'}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      Complete this step and mark it as done when you&apos;re ready.
                    </p>
                  </div>
                  <Button
                    onClick={() => markStepComplete(currentStep.id)}
                    disabled={processingStep}
                  >
                    {processingStep ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Mark as Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No steps configured */}
        {steps.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                No onboarding steps have been configured yet.
              </p>
              <Button onClick={handleFinishOnboarding}>
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* All Complete */}
        {allComplete && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-700 mb-2">
                You&apos;re all set! 🎉
              </h2>
              <p className="text-muted-foreground mb-4">
                You&apos;ve completed all onboarding steps.
              </p>
              <Button size="lg" onClick={handleFinishOnboarding}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

