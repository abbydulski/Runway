import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getOrgChartData, getDeelData } from '@/lib/mock-data'
import { CheckCircle2, Circle, Clock, UserPlus, Mail } from 'lucide-react'

export default async function OnboardingPage() {
  const [{ onboardingSteps }, { employees }] = await Promise.all([
    getOrgChartData(),
    getDeelData(),
  ])

  const pendingEmployees = employees.filter((e) => e.status === 'pending')

  // Group steps by category
  const categories = {
    personal: onboardingSteps.filter((s) => s.category === 'personal'),
    company: onboardingSteps.filter((s) => s.category === 'company'),
    tools: onboardingSteps.filter((s) => s.category === 'tools'),
    team: onboardingSteps.filter((s) => s.category === 'team'),
  }

  const categoryLabels = {
    personal: 'Personal Setup',
    company: 'Company Policies',
    tools: 'Tools & Access',
    team: 'Team Integration',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Manage employee onboarding and track progress
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Employee
        </Button>
      </div>

      {/* Pending Onboarding */}
      {pendingEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Onboarding
            </CardTitle>
            <CardDescription>
              Employees waiting to complete their onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
                      />
                      <AvatarFallback>
                        {employee.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Pending
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Steps Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Checklist</CardTitle>
          <CardDescription>
            Configure the steps new employees must complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {(Object.keys(categories) as Array<keyof typeof categories>).map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-2">
                  {categories[category].map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{step.title}</p>
                          {step.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

