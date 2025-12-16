'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Org Chart', href: '/dashboard/org-chart', icon: Users },
  { name: 'Teams Setup', href: '/dashboard/teams', icon: FolderKanban },
  { name: 'Invite', href: '/dashboard/invite', icon: UserPlus },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Link2 },
  { name: 'Logs', href: '/dashboard/logs', icon: ScrollText },
]

const integrations = [
  { name: 'GitHub', href: '/dashboard/github', icon: GitBranch },
  { name: 'Mercury', href: '/dashboard/mercury', icon: Landmark },
  { name: 'QuickBooks', href: '/dashboard/quickbooks', icon: Receipt },
  { name: 'Deel', href: '/dashboard/deel', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Image src="/logo.svg" alt="ASC" width={32} height={32} />
        <span className="text-xl font-bold">ASC</span>
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

        <Separator className="my-4" />

        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Integrations
        </p>
        {integrations.map((item) => {
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

