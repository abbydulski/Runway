'use client'

import { OrgChartNode } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OrgNodeProps {
  node: OrgChartNode
  isRoot?: boolean
}

export function OrgNode({ node, isRoot = false }: OrgNodeProps) {
  const initials = node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <Card
        className={cn(
          'w-48 transition-all hover:shadow-lg cursor-pointer',
          isRoot && 'border-primary border-2'
        )}
      >
        <CardContent className="p-4 text-center">
          <Avatar className="h-16 w-16 mx-auto mb-3">
            <AvatarImage src={node.avatar_url} alt={node.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-sm">{node.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{node.position}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            {node.department}
          </Badge>
        </CardContent>
      </Card>

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
          <div className="flex gap-6">
            {node.children.map((child, index) => (
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

