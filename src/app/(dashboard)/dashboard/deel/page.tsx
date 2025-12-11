import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getDeelData } from '@/lib/mock-data'
import { Briefcase, Users, Globe, DollarSign, Clock } from 'lucide-react'
import { DEFAULT_AVATAR } from '@/lib/utils'

export default async function DeelPage() {
  const { employees, payroll, stats } = await getDeelData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Briefcase className="h-8 w-8" />
          Deel
        </h1>
        <p className="text-muted-foreground">
          Global payroll, contractors, and compliance
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{stats.activeEmployees} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalMonthlyPayroll.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.countriesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Onboarding</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOnboarding}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Employees and contractors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={DEFAULT_AVATAR} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={employee.type === 'employee' ? 'default' : 'secondary'}>
                      {employee.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        employee.status === 'active' ? 'text-green-600 border-green-300' :
                        employee.status === 'pending' ? 'text-yellow-600 border-yellow-300' :
                        'text-red-600 border-red-300'
                      }
                    >
                      {employee.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payroll */}
        <Card>
          <CardHeader>
            <CardTitle>December Payroll</CardTitle>
            <CardDescription>Upcoming and completed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payroll.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.employee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.period} • {payment.payment_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {payment.currency === 'USD' ? '$' : payment.currency === 'GBP' ? '£' : 'C$'}
                      {payment.amount.toLocaleString()}
                    </p>
                    <Badge
                      variant={
                        payment.status === 'completed' ? 'outline' :
                        payment.status === 'processing' ? 'secondary' : 'default'
                      }
                      className={payment.status === 'completed' ? 'text-green-600 border-green-300' : ''}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

