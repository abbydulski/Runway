import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Settings, User, Building2 } from 'lucide-react'
import { SettingsForm } from './settings-form'
import { CompanyLogoForm } from './company-logo-form'
import { getAvatarUrl } from '@/lib/utils'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, organizations(id, name, logo_url)')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const initials = profile.name?.split(' ').map((n: string) => n[0]).join('') || 'U'
  const avatarUrl = getAvatarUrl(profile.avatar_url)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex gap-2">
                <Badge variant={profile.role === 'founder' ? 'default' : 'outline'}>
                  {profile.role === 'founder' ? 'Founder' : 'Employee'}
                </Badge>
                {profile.position && (
                  <Badge variant="outline">{profile.position}</Badge>
                )}
              </div>
            </div>
          </div>

          <SettingsForm profile={profile} />
        </CardContent>
      </Card>

      {/* Organization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
          <CardDescription>
            Your company information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="text-lg">{profile.organizations?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Your Department</label>
              <p className="text-lg">{profile.department || 'Not set'}</p>
            </div>

            {/* Company Logo Upload - Only for founders */}
            {profile.role === 'founder' && profile.organizations && (
              <CompanyLogoForm
                organizationId={profile.organizations.id}
                currentLogoUrl={profile.organizations.logo_url}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

