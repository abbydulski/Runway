import { QuickBooksInvoice, QuickBooksExpense, QuickBooksPnL } from '@/types'

export const mockInvoices: QuickBooksInvoice[] = [
  {
    id: 'inv_001',
    customer_name: 'Acme Corporation',
    amount: 50000.00,
    status: 'paid',
    due_date: '2024-12-15',
    issued_date: '2024-11-15',
  },
  {
    id: 'inv_002',
    customer_name: 'TechStart Inc',
    amount: 25000.00,
    status: 'paid',
    due_date: '2024-12-10',
    issued_date: '2024-11-10',
  },
  {
    id: 'inv_003',
    customer_name: 'Global Solutions Ltd',
    amount: 35000.00,
    status: 'pending',
    due_date: '2024-12-20',
    issued_date: '2024-11-20',
  },
  {
    id: 'inv_004',
    customer_name: 'StartupXYZ',
    amount: 15000.00,
    status: 'overdue',
    due_date: '2024-12-01',
    issued_date: '2024-11-01',
  },
  {
    id: 'inv_005',
    customer_name: 'Innovation Labs',
    amount: 42000.00,
    status: 'pending',
    due_date: '2024-12-25',
    issued_date: '2024-11-25',
  },
]

export const mockExpenses: QuickBooksExpense[] = [
  {
    id: 'exp_001',
    vendor: 'Amazon Web Services',
    amount: 2500.00,
    category: 'Cloud Infrastructure',
    date: '2024-12-03',
    description: 'Monthly cloud hosting',
  },
  {
    id: 'exp_002',
    vendor: 'WeWork',
    amount: 3500.00,
    category: 'Rent',
    date: '2024-12-01',
    description: 'Office space rental',
  },
  {
    id: 'exp_003',
    vendor: 'Deel',
    amount: 15000.00,
    category: 'Payroll',
    date: '2024-12-01',
    description: 'December payroll processing',
  },
  {
    id: 'exp_004',
    vendor: 'Figma',
    amount: 1200.00,
    category: 'Software',
    date: '2024-12-06',
    description: 'Design tool subscription',
  },
  {
    id: 'exp_005',
    vendor: 'Legal Partners LLP',
    amount: 5000.00,
    category: 'Legal',
    date: '2024-12-05',
    description: 'Contract review services',
  },
]

export const mockPnL: QuickBooksPnL[] = [
  { period: 'Jul 2024', revenue: 85000, expenses: 45000, net_income: 40000 },
  { period: 'Aug 2024', revenue: 92000, expenses: 48000, net_income: 44000 },
  { period: 'Sep 2024', revenue: 78000, expenses: 52000, net_income: 26000 },
  { period: 'Oct 2024', revenue: 105000, expenses: 55000, net_income: 50000 },
  { period: 'Nov 2024', revenue: 120000, expenses: 58000, net_income: 62000 },
  { period: 'Dec 2024', revenue: 167000, expenses: 27200, net_income: 139800 },
]

export async function getQuickBooksData() {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const totalRevenue = mockPnL.reduce((sum, p) => sum + p.revenue, 0)
  const totalExpenses = mockPnL.reduce((sum, p) => sum + p.expenses, 0)
  const pendingInvoices = mockInvoices.filter((i) => i.status === 'pending')
  const overdueInvoices = mockInvoices.filter((i) => i.status === 'overdue')

  return {
    invoices: mockInvoices,
    expenses: mockExpenses,
    pnl: mockPnL,
    stats: {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingAmount: pendingInvoices.reduce((sum, i) => sum + i.amount, 0),
      overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.amount, 0),
      invoiceCount: {
        paid: mockInvoices.filter((i) => i.status === 'paid').length,
        pending: pendingInvoices.length,
        overdue: overdueInvoices.length,
      },
    },
  }
}

