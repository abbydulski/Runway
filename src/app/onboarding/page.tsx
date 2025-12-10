'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, User, Building2, Wrench, Users } from 'lucide-react'
import Image from 'next/image'

const onboardingSteps = [
  {
    id: 'step_001',
    title: 'Complete Your Profile',
    description: 'Add your photo, bio, and contact information',
    category: 'personal',
    icon: User,
    required: true,
  },
  {
    id: 'step_002',
    title: 'Review Company Handbook',
    description: 'Read through our company policies and culture guide',
    category: 'company',
    icon: Building2,
    required: true,
  },
  {
    id: 'step_003',
    title: 'Set Up Development Environment',
    description: 'Install required tools and configure your workspace',
    category: 'tools',
    icon: Wrench,
    required: true,
  },
  {
    id: 'step_004',
    title: 'Connect GitHub Account',
    description: 'Link your GitHub account for repository access',
    category: 'tools',
    icon: Wrench,
    required: true,
  },
  {
    id: 'step_005',
    title: 'Complete Deel Profile',
    description: 'Set up your payment and tax information in Deel',
    category: 'tools',
    icon: Wrench,
    required: true,
  },
  {
    id: 'step_006',
    title: 'Meet Your Team',
    description: 'Schedule 1:1s with your team members',
    category: 'team',
    icon: Users,
    required: false,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const progress = (completedSteps.length / onboardingSteps.length) * 100

  const toggleStep = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter((id) => id !== stepId))
    } else {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const handleComplete = () => {
    router.push('/employee')
  }

  const allRequiredComplete = onboardingSteps
    .filter((s) => s.required)
    .every((s) => completedSteps.includes(s.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Runway" width={24} height={24} />
            <span className="text-xl font-bold">Runway</span>
          </div>
          <Badge variant="outline">Onboarding</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to the team! 🎉</h1>
          <p className="text-muted-foreground mt-2">
            Complete these steps to finish your onboarding
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.length} of {onboardingSteps.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {onboardingSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const Icon = step.icon

            return (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCompleted ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => toggleStep(step.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-100'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Icon className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{step.title}</h3>
                      {step.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300" />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Complete Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            disabled={!allRequiredComplete}
            onClick={handleComplete}
          >
            {allRequiredComplete ? 'Complete Onboarding' : 'Complete all required steps'}
          </Button>
        </div>
      </main>
    </div>
  )
}

