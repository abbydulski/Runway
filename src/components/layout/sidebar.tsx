'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Landmark,
  Receipt,
  Briefcase,
  UserPlus,
  Settings,
  LogOut,
  FolderKanban,
  Link2,
  ScrollText,
  DollarSign,
  MessageSquare,
  CreditCard,
  FileText,
  Layers,
  Key,
  Mail,
  Ticket,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scorecard', href: '/dashboard/scorecard', icon: Target },
  { name: 'Financials', href: '/dashboard/financials', icon: DollarSign },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Org Chart', href: '/dashboard/org-chart', icon: Users },
  { name: 'Teams Setup', href: '/dashboard/teams', icon: FolderKanban },
  { name: 'Onboarding Setup', href: '/dashboard/onboarding-setup', icon: Settings },
  { name: 'Invite', href: '/dashboard/invite', icon: UserPlus },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Link2 },
  { name: 'Logs', href: '/dashboard/logs', icon: ScrollText },
]

// All possible integrations with their config
const ALL_INTEGRATIONS: Record<string, { name: string; href: string; icon: LucideIcon }> = {
  slack: { name: 'Slack', href: '/dashboard/slack', icon: MessageSquare },
  github: { name: 'GitHub', href: '/dashboard/github', icon: GitBranch },
  quickbooks: { name: 'QuickBooks', href: '/dashboard/quickbooks', icon: Receipt },
  deel: { name: 'Deel', href: '/dashboard/deel', icon: Briefcase },
  mercury: { name: 'Mercury', href: '/dashboard/mercury', icon: Landmark },
  ramp: { name: 'Ramp', href: '/dashboard/ramp', icon: CreditCard },
  stripe: { name: 'Stripe', href: '/dashboard/stripe', icon: CreditCard },
  notion: { name: 'Notion', href: '/dashboard/notion', icon: FileText },
  linear: { name: 'Linear', href: '/dashboard/linear', icon: Layers },
  gusto: { name: 'Gusto', href: '/dashboard/gusto', icon: Users },
  onepassword: { name: '1Password', href: '/dashboard/1password', icon: Key },
  google_workspace: { name: 'Google', href: '/dashboard/google', icon: Mail },
  microsoft_365: { name: 'Microsoft', href: '/dashboard/microsoft', icon: Mail },
  ayer: { name: 'Ayer', href: '/dashboard/ayer', icon: Ticket },
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])

  useEffect(() => {
    async function loadIntegrations() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      const { data: org } = await supabase
        .from('organizations')
        .select('selected_integrations')
        .eq('id', profile.organization_id)
        .single()

      if (org?.selected_integrations) {
        setSelectedIntegrations(org.selected_integrations)
      }
    }
    loadIntegrations()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Image src="/RunwayLogo.png" alt="Runway" width={32} height={32} />
        <span className="text-xl font-bold">Runway</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Overview
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        {selectedIntegrations.length > 0 && (
          <>
            <Separator className="my-4" />

            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Integrations
            </p>
            {selectedIntegrations.map((integrationId) => {
              const item = ALL_INTEGRATIONS[integrationId]
              if (!item) return null
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={integrationId}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

