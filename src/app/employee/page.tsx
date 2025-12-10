import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Users, Calendar, FileText, DollarSign, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EmployeeDashboard() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*, organizations(name)')
    .eq('id', user.id)
    .single()

  // If founder, redirect to dashboard
  if (profile?.role === 'founder') {
    redirect('/dashboard')
  }

  const employee = {
    name: profile?.name || 'Team Member',
    email: profile?.email || user.email || '',
    position: profile?.position || 'Team Member',
    department: profile?.department || 'Not set',
    companyName: profile?.organizations?.name || 'Your Company',
    startDate: profile?.created_at || new Date().toISOString(),
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'user'}`,
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
              <AvatarFallback>
                {employee.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
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
                <AvatarFallback className="text-2xl">
                  {employee.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
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
                Your Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{employee.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
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

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Payment information will be available once Deel integration is connected.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Connect Deel
                </Button>
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

