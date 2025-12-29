import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAvatarUrl } from '@/lib/utils'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get user profile with organization data
  const { data: profile } = await supabase
    .from('users')
    .select('name, email, avatar_url, role, organization_id, organizations(logo_url)')
    .eq('id', authUser.id)
    .single()

  // Redirect non-founders to employee page
  if (profile?.role !== 'founder') {
    redirect('/employee')
  }

  // Get company logo from organization
  const org = Array.isArray(profile?.organizations)
    ? profile.organizations[0]
    : profile?.organizations
  const companyLogo = org?.logo_url ? getAvatarUrl(org.logo_url) : undefined

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={profile?.name || 'User'}
          userEmail={profile?.email || authUser.email || ''}
          userAvatar={getAvatarUrl(profile?.avatar_url)}
          companyLogo={companyLogo}
        />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

