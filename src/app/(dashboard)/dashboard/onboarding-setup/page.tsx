'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  MessageSquare, 
  Github, 
  Mail, 
  FileText, 
  Users, 
  BookOpen,
  CheckCircle,
  Plus,
  GripVertical,
  Trash2,
  Save
} from 'lucide-react'

interface OnboardingStepConfig {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: 'integration' | 'manual' | 'document'
  provider?: string
  enabled: boolean
  required: boolean
  documentUrl?: string
  isCustom?: boolean
}

const defaultSteps: OnboardingStepConfig[] = [
  {
    id: 'slack',
    title: 'Join Slack Workspace',
    description: 'Add employee to your Slack workspace and team channels',
    icon: <MessageSquare className="h-5 w-5" />,
    type: 'integration',
    provider: 'slack',
    enabled: true,
    required: true,
  },
  {
    id: 'github',
    title: 'GitHub Access',
    description: 'Add employee to GitHub organization and relevant repos',
    icon: <Github className="h-5 w-5" />,
    type: 'integration',
    provider: 'github',
    enabled: false,
    required: false,
  },
  {
    id: 'google',
    title: 'Google Workspace',
    description: 'Provision company email and Google Drive access',
    icon: <Mail className="h-5 w-5" />,
    type: 'integration',
    provider: 'google_workspace',
    enabled: false,
    required: false,
  },
  {
    id: 'nda',
    title: 'Sign NDA',
    description: 'Employee signs non-disclosure agreement',
    icon: <FileText className="h-5 w-5" />,
    type: 'document',
    enabled: true,
    required: true,
    documentUrl: '',
  },
  {
    id: 'handbook',
    title: 'Read Employee Handbook',
    description: 'Review company policies and guidelines',
    icon: <BookOpen className="h-5 w-5" />,
    type: 'document',
    enabled: true,
    required: false,
    documentUrl: '',
  },
  {
    id: 'manager',
    title: 'Meet with Manager',
    description: 'Schedule intro 1:1 with direct manager',
    icon: <Users className="h-5 w-5" />,
    type: 'manual',
    enabled: true,
    required: true,
  },
]

export default function OnboardingSetupPage() {
  const [steps, setSteps] = useState<OnboardingStepConfig[]>(defaultSteps)
  const [customStepTitle, setCustomStepTitle] = useState('')
  const [customStepDescription, setCustomStepDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleStep = (id: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const toggleRequired = (id: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, required: !s.required } : s))
  }

  const updateDocumentUrl = (id: string, url: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, documentUrl: url } : s))
  }

  const addCustomStep = () => {
    if (!customStepTitle.trim()) return
    const newStep: OnboardingStepConfig = {
      id: `custom-${Date.now()}`,
      title: customStepTitle,
      description: customStepDescription || 'Custom onboarding step',
      icon: <CheckCircle className="h-5 w-5" />,
      type: 'manual',
      enabled: true,
      required: false,
      isCustom: true,
    }
    setSteps([...steps, newStep])
    setCustomStepTitle('')
    setCustomStepDescription('')
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save to database
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const enabledSteps = steps.filter(s => s.enabled)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Onboarding Setup
        </h1>
        <p className="text-muted-foreground">
          Configure the onboarding steps for new employees
        </p>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{enabledSteps.length} steps enabled</p>
              <p className="text-sm text-muted-foreground">
                {enabledSteps.filter(s => s.required).length} required, {enabledSteps.filter(s => !s.required).length} optional
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Automated steps that connect employees to your tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.filter(s => s.type === 'integration').map(step => (
            <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className={`p-2 rounded-lg ${step.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{step.title}</p>
                    {step.enabled && step.required && <Badge variant="secondary">Required</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {step.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`req-${step.id}`} className="text-sm">Required</Label>
                    <Switch
                      id={`req-${step.id}`}
                      checked={step.required}
                      onCheckedChange={() => toggleRequired(step.id)}
                    />
                  </div>
                )}
                <Switch checked={step.enabled} onCheckedChange={() => toggleStep(step.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Document Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Documents & Policies</CardTitle>
          <CardDescription>Documents employees need to read or sign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.filter(s => s.type === 'document').map(step => (
            <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className={`p-2 rounded-lg ${step.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  {step.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{step.title}</p>
                    {step.enabled && step.required && <Badge variant="secondary">Required</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.enabled && (
                    <Input
                      placeholder="Document URL (e.g., https://notion.so/handbook)"
                      value={step.documentUrl || ''}
                      onChange={(e) => updateDocumentUrl(step.id, e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {step.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`req-${step.id}`} className="text-sm">Required</Label>
                    <Switch
                      id={`req-${step.id}`}
                      checked={step.required}
                      onCheckedChange={() => toggleRequired(step.id)}
                    />
                  </div>
                )}
                <Switch checked={step.enabled} onCheckedChange={() => toggleStep(step.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Manual Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Steps</CardTitle>
          <CardDescription>Tasks employees complete on their own</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.filter(s => s.type === 'manual').map(step => (
            <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className={`p-2 rounded-lg ${step.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{step.title}</p>
                    {step.enabled && step.required && <Badge variant="secondary">Required</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {step.isCustom && (
                  <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
                {step.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`req-${step.id}`} className="text-sm">Required</Label>
                    <Switch
                      id={`req-${step.id}`}
                      checked={step.required}
                      onCheckedChange={() => toggleRequired(step.id)}
                    />
                  </div>
                )}
                <Switch checked={step.enabled} onCheckedChange={() => toggleStep(step.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Custom Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom Step
          </CardTitle>
          <CardDescription>Create your own onboarding step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Step Title</Label>
              <Input
                id="title"
                placeholder="e.g., Set up desk"
                value={customStepTitle}
                onChange={(e) => setCustomStepTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input
                id="desc"
                placeholder="e.g., Get your equipment from IT"
                value={customStepDescription}
                onChange={(e) => setCustomStepDescription(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addCustomStep} disabled={!customStepTitle.trim()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

