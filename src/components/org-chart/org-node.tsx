'use client'

import { OrgChartNode } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Mail, Building2, User, Users } from 'lucide-react'

interface OrgNodeProps {
  node: OrgChartNode
  isRoot?: boolean
  email?: string
}

export function OrgNode({ node, isRoot = false, email }: OrgNodeProps) {
  const initials = node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const avatarUrl = node.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${node.name}`

  return (
    <div className="flex flex-col items-center">
      {/* Node Card with Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={cn(
              'w-48 transition-all hover:shadow-lg hover:scale-105 cursor-pointer',
              isRoot && 'border-primary border-2 bg-primary/5'
            )}
          >
            <CardContent className="p-4 text-center">
              <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-offset-2 ring-primary/20">
                <AvatarImage src={avatarUrl} alt={node.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-sm">{node.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{node.position}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {node.department}
              </Badge>
              {isRoot && <Badge className="mt-1">Founder</Badge>}
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl} alt={node.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl">{node.name}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {node.position}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${email}`} className="text-primary hover:underline">
                  {email}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{node.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <Badge variant={isRoot ? 'default' : 'outline'}>
                {isRoot ? 'Founder' : 'Employee'}
              </Badge>
            </div>
            {node.children && node.children.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Direct Reports ({node.children.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.children.map(child => (
                    <Badge key={child.id} variant="outline" className="text-xs">
                      {child.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <>
          {/* Connector line down */}
          <div className="w-px h-8 bg-border" />

          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div
              className="h-px bg-border"
              style={{
                width: `${(node.children.length - 1) * 220}px`,
              }}
            />
          )}

          {/* Children nodes */}
          <div className="flex gap-6 flex-wrap justify-center">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Connector line up to child */}
                <div className="w-px h-8 bg-border" />
                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

