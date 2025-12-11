'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface RunwayChartProps {
  data: {
    period: string
    revenue: number
    expenses: number
    net_income: number
  }[]
  bankBalance: number
  monthlyBurn: number
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444']

export function RunwayChart({ data, bankBalance, monthlyBurn }: RunwayChartProps) {
  // Generate runway projection data
  const projectionMonths = 12
  const runwayData = []
  let balance = bankBalance
  
  for (let i = 0; i <= projectionMonths; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' })
    
    runwayData.push({
      month: monthName,
      balance: Math.max(0, balance),
    })
    balance -= monthlyBurn
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runway Projection</CardTitle>
        <CardDescription>Projected cash runway at current burn rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={runwayData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
              labelClassName="font-medium"
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function RevenueExpenseChart({ data }: { data: RunwayChartProps['data'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>Monthly financial performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="period" className="text-xs" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TeamChartProps {
  contractors: number
  fullTime: number
  pending: number
}

export function TeamCompositionChart({ contractors, fullTime, pending }: TeamChartProps) {
  const data = [
    { name: 'Full-time', value: fullTime },
    { name: 'Contractors', value: contractors },
    { name: 'Pending', value: pending },
  ].filter(d => d.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Composition</CardTitle>
        <CardDescription>Breakdown of employee types</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

