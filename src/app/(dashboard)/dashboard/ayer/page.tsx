'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, MapPin, Ruler, DollarSign, Clock, CheckCircle2, AlertCircle, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AyerTicketsCard, MOCK_AYER_TICKETS } from '@/components/ayer-tickets'

export default function AyerPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const loadIntegration = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      const { data: ayerInt } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('provider', 'ayer')
        .single()

      setIsConnected(!!ayerInt)
      setLoading(false)
    }
    loadIntegration()
  }, [supabase])

  // Calculate stats from mock data
  const totalTickets = MOCK_AYER_TICKETS.length
  const completedTickets = MOCK_AYER_TICKETS.filter(t => t.status === 'completed').length
  const inProgressTickets = MOCK_AYER_TICKETS.filter(t => t.status === 'in_progress').length
  const openTickets = MOCK_AYER_TICKETS.filter(t => t.status === 'open').length
  const totalLinearFeet = MOCK_AYER_TICKETS.reduce((sum, t) => sum + t.linearFeet, 0)
  const totalRevenue = MOCK_AYER_TICKETS.reduce((sum, t) => sum + t.price, 0)
  const totalHours = MOCK_AYER_TICKETS.reduce((sum, t) => sum + (t.hoursWorked || 0), 0)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Ticket className="h-8 w-8 text-amber-600" />
            Ayer
          </h1>
          <p className="text-muted-foreground">
            Field ticketing and job tracking
          </p>
        </div>
        <Badge className={isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {isConnected ? (
            <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
          ) : (
            <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
          )}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{totalTickets}</div>
            <p className="text-xs text-amber-600">
              {openTickets} open, {inProgressTickets} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{completedTickets}</div>
            <p className="text-xs text-green-600">
              {Math.round((completedTickets / totalTickets) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linear Feet</CardTitle>
            <Ruler className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalLinearFeet.toLocaleString()}</div>
            <p className="text-xs text-blue-600">Total measured</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-purple-600">{totalHours}h worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <AyerTicketsCard 
        title="All Field Tickets"
        description="View and manage all tickets from Ayer"
      />

      {/* Connect prompt if not connected */}
      {!isConnected && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Ayer</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Connect your Ayer account to sync field tickets and track job progress in real-time.
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Connect Ayer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

