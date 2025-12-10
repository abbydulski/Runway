import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Users, Calendar, FileText, DollarSign, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function EmployeeDashboard() {
  // Mock employee data
  const employee = {
    name: 'Alex Kim',
    email: 'alex@acme-startup.com',
    position: 'Backend Developer',
    department: 'Engineering',
    manager: 'Sarah Chen',
    startDate: '2024-08-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  }

  const upcomingPayment = {
    amount: 7916.67,
    currency: 'CAD',
    date: '2024-12-15',
    status: 'scheduled',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Runway" width={24} height={24} />
            <span className="text-xl font-bold">Runway</span>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {employee.name}! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s your personal dashboard
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl">AK</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-muted-foreground">{employee.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{employee.position}</Badge>
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{employee.manager}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(employee.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Upcoming Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">
                    C${upcomingPayment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">December 2024</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <Badge variant="secondary">{upcomingPayment.date}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className="capitalize">
                    {upcomingPayment.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access important resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Company Handbook</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Time Off Requests</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Pay Stubs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

