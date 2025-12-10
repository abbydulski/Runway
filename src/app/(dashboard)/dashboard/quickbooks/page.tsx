import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getQuickBooksData } from '@/lib/mock-data'
import { Receipt, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

export default async function QuickBooksPage() {
  const { invoices, expenses, pnl, stats } = await getQuickBooksData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Receipt className="h-8 w-8" />
          QuickBooks
        </h1>
        <p className="text-muted-foreground">
          Financial overview, invoices, and expenses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (6mo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (6mo)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.invoiceCount.pending} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.overdueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.invoiceCount.overdue} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Chart Data */}
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss (Last 6 Months)</CardTitle>
          <CardDescription>Revenue, expenses, and net income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pnl.map((period) => (
              <div key={period.period} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{period.period}</span>
                  <span className={`font-semibold ${period.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${period.net_income.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2 h-4">
                  <div
                    className="bg-green-500 rounded"
                    style={{ width: `${(period.revenue / 170000) * 100}%` }}
                    title={`Revenue: $${period.revenue.toLocaleString()}`}
                  />
                  <div
                    className="bg-red-400 rounded"
                    style={{ width: `${(period.expenses / 170000) * 100}%` }}
                    title={`Expenses: $${period.expenses.toLocaleString()}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-400 rounded" />
              <span>Expenses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Recent customer invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.customer_name}</p>
                    <p className="text-sm text-muted-foreground">Due {invoice.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                    <Badge
                      variant={
                        invoice.status === 'paid' ? 'outline' :
                        invoice.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={invoice.status === 'paid' ? 'text-green-600 border-green-300' : ''}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest business expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.vendor}</p>
                    <p className="text-sm text-muted-foreground">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${expense.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{expense.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

