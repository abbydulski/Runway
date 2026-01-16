'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, MapPin, Ruler, DollarSign, Clock } from 'lucide-react'

// Mock Ayer ticket data
export interface AyerTicket {
  id: string
  location: string
  linearFeet: number
  price: number
  hoursWorked: number | null
  status: 'open' | 'in_progress' | 'completed'
  assignee?: string
  createdAt: string
}

export const MOCK_AYER_TICKETS: AyerTicket[] = [
  {
    id: 'AYR-001',
    location: '123 Main St, Austin TX',
    linearFeet: 450,
    price: 2250,
    hoursWorked: 4.5,
    status: 'completed',
    assignee: 'Mike Johnson',
    createdAt: '2024-01-15',
  },
  {
    id: 'AYR-002',
    location: '456 Oak Ave, Dallas TX',
    linearFeet: 320,
    price: 1600,
    hoursWorked: 3.0,
    status: 'in_progress',
    assignee: 'Sarah Chen',
    createdAt: '2024-01-16',
  },
  {
    id: 'AYR-003',
    location: '789 Pine Rd, Houston TX',
    linearFeet: 180,
    price: 900,
    hoursWorked: null,
    status: 'open',
    createdAt: '2024-01-17',
  },
  {
    id: 'AYR-004',
    location: '321 Elm St, San Antonio TX',
    linearFeet: 275,
    price: 1375,
    hoursWorked: 2.5,
    status: 'completed',
    assignee: 'Mike Johnson',
    createdAt: '2024-01-14',
  },
  {
    id: 'AYR-005',
    location: '654 Cedar Ln, Fort Worth TX',
    linearFeet: 520,
    price: 2600,
    hoursWorked: 1.5,
    status: 'in_progress',
    assignee: 'James Wilson',
    createdAt: '2024-01-17',
  },
]

function getStatusBadge(status: AyerTicket['status']) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
    case 'open':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Open</Badge>
  }
}

interface AyerTicketsCardProps {
  tickets?: AyerTicket[]
  title?: string
  description?: string
  showAssignee?: boolean
}

export function AyerTicketsCard({
  tickets = MOCK_AYER_TICKETS,
  title = 'Field Tickets',
  description = 'Active tickets from Ayer',
  showAssignee = true,
}: AyerTicketsCardProps) {
  const totalLinearFeet = tickets.reduce((sum, t) => sum + t.linearFeet, 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0)
  const completedCount = tickets.filter(t => t.status === 'completed').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-amber-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{tickets.length}</p>
              <p className="text-muted-foreground">Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              <p className="text-muted-foreground">Revenue</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono font-medium">{ticket.id}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {ticket.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1" title="Linear Feet">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{ticket.linearFeet} ft</span>
                </div>
                <div className="flex items-center gap-1" title="Price">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">${ticket.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 w-16" title="Hours Worked">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {ticket.hoursWorked !== null ? `${ticket.hoursWorked}h` : '-'}
                  </span>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

