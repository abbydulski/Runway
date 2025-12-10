import { MercuryAccount, MercuryTransaction } from '@/types'

export const mockAccounts: MercuryAccount[] = [
  {
    id: 'acc_001',
    name: 'Operating Account',
    type: 'checking',
    balance: 847250.00,
    currency: 'USD',
  },
  {
    id: 'acc_002',
    name: 'Savings Reserve',
    type: 'savings',
    balance: 250000.00,
    currency: 'USD',
  },
]

export const mockTransactions: MercuryTransaction[] = [
  {
    id: 'txn_001',
    amount: 15000.00,
    description: 'Deel Payroll - December 2024',
    category: 'Payroll',
    date: '2024-12-01T00:00:00Z',
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'txn_002',
    amount: 2500.00,
    description: 'AWS Cloud Services',
    category: 'Infrastructure',
    date: '2024-12-03T00:00:00Z',
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'txn_003',
    amount: 50000.00,
    description: 'Customer Payment - Acme Corp',
    category: 'Revenue',
    date: '2024-12-05T00:00:00Z',
    type: 'credit',
    status: 'completed',
  },
  {
    id: 'txn_004',
    amount: 1200.00,
    description: 'Figma Team Plan',
    category: 'Software',
    date: '2024-12-06T00:00:00Z',
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'txn_005',
    amount: 800.00,
    description: 'Notion Enterprise',
    category: 'Software',
    date: '2024-12-07T00:00:00Z',
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'txn_006',
    amount: 3500.00,
    description: 'Office Rent - WeWork',
    category: 'Facilities',
    date: '2024-12-08T00:00:00Z',
    type: 'debit',
    status: 'pending',
  },
  {
    id: 'txn_007',
    amount: 25000.00,
    description: 'Customer Payment - TechStart Inc',
    category: 'Revenue',
    date: '2024-12-09T00:00:00Z',
    type: 'credit',
    status: 'completed',
  },
  {
    id: 'txn_008',
    amount: 450.00,
    description: 'Slack Business+',
    category: 'Software',
    date: '2024-12-10T00:00:00Z',
    type: 'debit',
    status: 'pending',
  },
]

export async function getMercuryData() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const monthlySpend = mockTransactions
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyRevenue = mockTransactions
    .filter((t) => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    accounts: mockAccounts,
    transactions: mockTransactions,
    stats: {
      totalBalance,
      monthlySpend,
      monthlyRevenue,
      runway: Math.round(totalBalance / (monthlySpend || 1)),
    },
  }
}

