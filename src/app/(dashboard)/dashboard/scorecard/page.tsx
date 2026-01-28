'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Bug,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Metric {
  id: string
  name: string
  goal: string
  goalValue: number
  unit: 'number' | 'currency' | 'percentage'
  direction: 'higher' | 'lower' // higher is better or lower is better
  calculation: string
  category: 'sales' | 'operations' | 'product' | 'finance'
  icon: typeof Target
}

const METRICS: Metric[] = [
  // Sales Metrics
  { id: 'qualified_meetings', name: 'Qualified Meetings', goal: '5', goalValue: 5, unit: 'number', direction: 'higher', calculation: 'Count of decision-maker meetings with budget/need', category: 'sales', icon: Users },
  { id: 'weighted_pipeline', name: 'Weighted Pipeline', goal: '$500k', goalValue: 500000, unit: 'currency', direction: 'higher', calculation: 'Sum of (Opp value × Stage %)', category: 'sales', icon: TrendingUp },
  { id: 'proposals_sent', name: 'Proposals Sent', goal: '3', goalValue: 3, unit: 'number', direction: 'higher', calculation: 'Count of proposals delivered to prospects', category: 'sales', icon: Target },
  { id: 'signed_contracts', name: 'Signed Contracts', goal: '$15K', goalValue: 15000, unit: 'currency', direction: 'higher', calculation: 'Total contract value closed', category: 'sales', icon: DollarSign },
  
  // Operations Metrics
  { id: 'crew_utilization', name: 'Crew Utilization', goal: '70%', goalValue: 70, unit: 'percentage', direction: 'higher', calculation: '(Billable hours ÷ Available hours) × 100', category: 'operations', icon: Clock },
  { id: 'hdd_placeholder', name: 'HDD Placeholder', goal: '-', goalValue: 0, unit: 'number', direction: 'higher', calculation: 'TBD', category: 'operations', icon: Target },
  { id: 'service_gross_margin', name: 'Service Gross Margin', goal: '50%', goalValue: 50, unit: 'percentage', direction: 'higher', calculation: '(Service Revenue - Field Labor Costs) ÷ Service Revenue × 100', category: 'operations', icon: TrendingUp },
  { id: 'blocking_issues', name: 'Blocking Issues', goal: '0', goalValue: 0, unit: 'number', direction: 'lower', calculation: 'Count of must-fix items blocking field deployment', category: 'operations', icon: AlertTriangle },
  { id: 'field_hours', name: 'Field/Testing Hours', goal: '40+', goalValue: 40, unit: 'number', direction: 'higher', calculation: 'Hours used on paying jobs or test jobs this week', category: 'operations', icon: Clock },
  
  // Product Metrics
  { id: 'weekly_active_users', name: 'Weekly Active Users', goal: '?', goalValue: 0, unit: 'number', direction: 'higher', calculation: 'Unique logins this week', category: 'product', icon: Users },
  { id: 'critical_bugs', name: 'Critical Bugs Open', goal: '≤3', goalValue: 3, unit: 'number', direction: 'lower', calculation: 'P0/P1 severity bugs', category: 'product', icon: Bug },
  { id: 'deployment_frequency', name: 'Deployment Frequency', goal: '≥3', goalValue: 3, unit: 'number', direction: 'higher', calculation: 'Production releases this week', category: 'product', icon: Rocket },
  
  // Finance Metrics
  { id: 'weekly_revenue', name: 'Weekly Revenue', goal: '$20k', goalValue: 20000, unit: 'currency', direction: 'higher', calculation: 'Total invoiced this week', category: 'finance', icon: DollarSign },
  { id: 'accounts_receivable', name: 'Total Accounts Receivable', goal: '$1000k', goalValue: 1000000, unit: 'currency', direction: 'higher', calculation: 'All outstanding invoices', category: 'finance', icon: DollarSign },
]

type MetricValues = Record<string, number>

export default function ScorecardPage() {
  const [values, setValues] = useState<MetricValues>({})
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSavedValues()
  }, [])

  async function loadSavedValues() {
    // For now, load from localStorage. Later can be saved to Supabase
    const saved = localStorage.getItem('scorecard_values')
    if (saved) {
      const parsed = JSON.parse(saved)
      setValues(parsed.values || {})
      setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null)
    }
  }

  async function saveValues() {
    setSaving(true)
    // Save to localStorage for now
    const data = { values, savedAt: new Date().toISOString() }
    localStorage.setItem('scorecard_values', JSON.stringify(data))
    setLastSaved(new Date())
    setSaving(false)
  }

  function resetValues() {
    if (confirm('Are you sure you want to reset all values?')) {
      setValues({})
      localStorage.removeItem('scorecard_values')
      setLastSaved(null)
    }
  }

  function updateValue(metricId: string, value: string) {
    const numValue = parseFloat(value) || 0
    setValues(prev => ({ ...prev, [metricId]: numValue }))
  }

  function getProgress(metric: Metric): number {
    const value = values[metric.id] || 0
    if (metric.goalValue === 0) return 0
    
    if (metric.direction === 'lower') {
      // For "lower is better", 0 = 100%, goal = 50%, 2x goal = 0%
      if (value === 0) return 100
      return Math.max(0, Math.min(100, ((metric.goalValue * 2 - value) / (metric.goalValue * 2)) * 100))
    }
    
    return Math.min(100, (value / metric.goalValue) * 100)
  }

  function getStatus(metric: Metric): 'success' | 'warning' | 'danger' {
    const progress = getProgress(metric)
    if (progress >= 80) return 'success'
    if (progress >= 50) return 'warning'
    return 'danger'
  }

  function formatValue(value: number, unit: Metric['unit']): string {
    if (unit === 'currency') return `$${value.toLocaleString()}`
    if (unit === 'percentage') return `${value}%`
    return value.toString()
  }

  const categories = [
    { id: 'sales', name: 'Sales', icon: TrendingUp },
    { id: 'operations', name: 'Operations', icon: Clock },
    { id: 'product', name: 'Product', icon: Rocket },
    { id: 'finance', name: 'Finance', icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Scorecard</h1>
          <p className="text-muted-foreground">
            Track key metrics against goals. Manual entry for now — integrations coming soon.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={resetValues}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveValues} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Overall Progress Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {categories.map(cat => {
          const catMetrics = METRICS.filter(m => m.category === cat.id)
          const avgProgress = catMetrics.reduce((sum, m) => sum + getProgress(m), 0) / catMetrics.length
          const Icon = cat.icon
          return (
            <Card key={cat.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(avgProgress)}%</span>
                </div>
                <Progress value={avgProgress} className="h-2" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Metrics by Category */}
      {categories.map(cat => {
        const catMetrics = METRICS.filter(m => m.category === cat.id)
        const Icon = cat.icon
        return (
          <Card key={cat.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {cat.name} Metrics
              </CardTitle>
              <CardDescription>Enter your weekly values below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {catMetrics.map(metric => {
                  const value = values[metric.id] || 0
                  const progress = getProgress(metric)
                  const status = getStatus(metric)
                  const MetricIcon = metric.icon

                  return (
                    <div key={metric.id} className="space-y-3 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MetricIcon className="h-4 w-4 text-muted-foreground" />
                          <Label className="font-medium">{metric.name}</Label>
                        </div>
                        <Badge variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                          {status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : status === 'danger' ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
                          {Math.round(progress)}%
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            type="number"
                            value={value || ''}
                            onChange={(e) => updateValue(metric.id, e.target.value)}
                            placeholder="Enter value"
                            className="bg-background"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground w-20 text-right">
                          Goal: {metric.goal}
                        </div>
                      </div>

                      <Progress
                        value={progress}
                        className={`h-2 ${status === 'success' ? '[&>div]:bg-green-500' : status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                      />

                      <p className="text-xs text-muted-foreground">{metric.calculation}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

