'use client'

import { useState, useEffect } from 'react'
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
  Save,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  stepOrder: number
}

// Map of step IDs to their icons (since we can't store React nodes in DB)
const stepIcons: Record<string, React.ReactNode> = {
  slack: <MessageSquare className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />,
  google: <Mail className="h-5 w-5" />,
  nda: <FileText className="h-5 w-5" />,
  handbook: <BookOpen className="h-5 w-5" />,
  manager: <Users className="h-5 w-5" />,
  default: <CheckCircle className="h-5 w-5" />,
}

const defaultSteps: Omit<OnboardingStepConfig, 'icon'>[] = [
  { id: 'slack', title: 'Join Slack Workspace', description: 'Add employee to your Slack workspace and team channels', type: 'integration', provider: 'slack', enabled: true, required: true, stepOrder: 1 },
  { id: 'github', title: 'GitHub Access', description: 'Add employee to GitHub organization and relevant repos', type: 'integration', provider: 'github', enabled: false, required: false, stepOrder: 2 },
  { id: 'google', title: 'Google Workspace', description: 'Provision company email and Google Drive access', type: 'integration', provider: 'google_workspace', enabled: false, required: false, stepOrder: 3 },
  { id: 'nda', title: 'Sign NDA', description: 'Employee signs non-disclosure agreement', type: 'document', enabled: true, required: true, documentUrl: '', stepOrder: 4 },
  { id: 'handbook', title: 'Read Employee Handbook', description: 'Review company policies and guidelines', type: 'document', enabled: true, required: false, documentUrl: '', stepOrder: 5 },
  { id: 'manager', title: 'Meet with Manager', description: 'Schedule intro 1:1 with direct manager', type: 'manual', enabled: true, required: true, stepOrder: 6 },
]

function getIcon(stepId: string): React.ReactNode {
  return stepIcons[stepId] || stepIcons.default
}

export default function OnboardingSetupPage() {
  const supabase = createClient()
  const [steps, setSteps] = useState<OnboardingStepConfig[]>([])
  const [customStepTitle, setCustomStepTitle] = useState('')
  const [customStepDescription, setCustomStepDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [handbookUrl, setHandbookUrl] = useState<string>('')
  const [savingHandbook, setSavingHandbook] = useState(false)

  // Load steps from database on mount
  useEffect(() => {
    async function loadSteps() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return
      setOrgId(profile.organization_id)

      // Load handbook URL from organization
      const { data: org } = await supabase
        .from('organizations')
        .select('handbook_url')
        .eq('id', profile.organization_id)
        .single()

      if (org?.handbook_url) {
        setHandbookUrl(org.handbook_url)
      }

      // Load existing steps from database
      const { data: dbSteps } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('step_order')

      if (dbSteps && dbSteps.length > 0) {
        // Map database steps to our config format
        setSteps(dbSteps.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description || '',
          icon: getIcon(s.integration_provider || s.id),
          type: s.step_type || 'manual',
          provider: s.integration_provider,
          enabled: s.is_enabled ?? true,
          required: s.required ?? false,
          documentUrl: s.document_url || '',
          isCustom: !['slack', 'github', 'google', 'nda', 'handbook', 'manager'].includes(s.integration_provider || s.id),
          stepOrder: s.step_order,
        })))
      } else {
        // No steps in DB yet, use defaults with icons
        setSteps(defaultSteps.map(s => ({ ...s, icon: getIcon(s.id) })))
      }
      setLoading(false)
    }
    loadSteps()
  }, [supabase])

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
    const maxOrder = Math.max(...steps.map(s => s.stepOrder), 0)
    const newStep: OnboardingStepConfig = {
      id: `custom-${Date.now()}`,
      title: customStepTitle,
      description: customStepDescription || 'Custom onboarding step',
      icon: <CheckCircle className="h-5 w-5" />,
      type: 'manual',
      enabled: true,
      required: false,
      isCustom: true,
      stepOrder: maxOrder + 1,
    }
    setSteps([...steps, newStep])
    setCustomStepTitle('')
    setCustomStepDescription('')
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id))
  }

  const handleSaveHandbookUrl = async () => {
    if (!orgId) return
    setSavingHandbook(true)

    await supabase
      .from('organizations')
      .update({ handbook_url: handbookUrl || null })
      .eq('id', orgId)

    setSavingHandbook(false)
  }

  const handleSave = async () => {
    if (!orgId) return
    setIsSaving(true)

    try {
      // Delete existing steps for this org
      await supabase
        .from('onboarding_steps')
        .delete()
        .eq('organization_id', orgId)

      // Insert all current steps
      const stepsToInsert = steps.map((s, index) => ({
        organization_id: orgId,
        title: s.title,
        description: s.description,
        category: s.type === 'integration' ? 'tools' : s.type === 'document' ? 'company' : 'team',
        step_type: s.type,
        integration_provider: s.provider || null,
        document_url: s.documentUrl || null,
        step_order: index + 1,
        required: s.required,
        is_enabled: s.enabled,
      }))

      const { error } = await supabase
        .from('onboarding_steps')
        .insert(stepsToInsert)

      if (error) {
        console.error('Save error:', error)
        alert('Failed to save: ' + error.message)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Save error:', err)
    }

    setIsSaving(false)
  }

  const enabledSteps = steps.filter(s => s.enabled)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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

      {/* Employee Handbook Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Employee Handbook
          </CardTitle>
          <CardDescription>
            Add a link to your employee handbook (Notion, Google Docs, PDF, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              placeholder="https://notion.so/your-company/handbook or any URL"
              value={handbookUrl}
              onChange={(e) => setHandbookUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleSaveHandbookUrl}
              disabled={savingHandbook}
            >
              {savingHandbook ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
            {handbookUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a href={handbookUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
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

