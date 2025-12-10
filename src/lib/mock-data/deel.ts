import { DeelEmployee, DeelPayroll } from '@/types'

export const mockEmployees: DeelEmployee[] = [
  {
    id: 'emp_001',
    name: 'Sarah Chen',
    email: 'sarah@acme-startup.com',
    type: 'employee',
    country: 'United States',
    start_date: '2024-01-15',
    salary: 120000,
    status: 'active',
  },
  {
    id: 'emp_002',
    name: 'Marcus Johnson',
    email: 'marcus@acme-startup.com',
    type: 'employee',
    country: 'United States',
    start_date: '2024-03-01',
    salary: 110000,
    status: 'active',
  },
  {
    id: 'emp_003',
    name: 'Emily Rodriguez',
    email: 'emily@acme-startup.com',
    type: 'contractor',
    country: 'Spain',
    start_date: '2024-06-15',
    rate: 85,
    status: 'active',
  },
  {
    id: 'emp_004',
    name: 'Alex Kim',
    email: 'alex@acme-startup.com',
    type: 'employee',
    country: 'Canada',
    start_date: '2024-08-01',
    salary: 95000,
    status: 'active',
  },
  {
    id: 'emp_005',
    name: 'Jordan Lee',
    email: 'jordan@acme-startup.com',
    type: 'contractor',
    country: 'United Kingdom',
    start_date: '2024-09-15',
    rate: 75,
    status: 'active',
  },
  {
    id: 'emp_006',
    name: 'Taylor Swift',
    email: 'taylor@acme-startup.com',
    type: 'employee',
    country: 'United States',
    start_date: '2024-12-01',
    salary: 85000,
    status: 'pending',
  },
]

export const mockPayroll: DeelPayroll[] = [
  {
    id: 'pay_001',
    employee_id: 'emp_001',
    employee_name: 'Sarah Chen',
    amount: 10000.00,
    currency: 'USD',
    period: 'December 2024',
    status: 'completed',
    payment_date: '2024-12-01',
  },
  {
    id: 'pay_002',
    employee_id: 'emp_002',
    employee_name: 'Marcus Johnson',
    amount: 9166.67,
    currency: 'USD',
    period: 'December 2024',
    status: 'completed',
    payment_date: '2024-12-01',
  },
  {
    id: 'pay_003',
    employee_id: 'emp_003',
    employee_name: 'Emily Rodriguez',
    amount: 6800.00,
    currency: 'USD',
    period: 'December 2024',
    status: 'processing',
    payment_date: '2024-12-15',
  },
  {
    id: 'pay_004',
    employee_id: 'emp_004',
    employee_name: 'Alex Kim',
    amount: 7916.67,
    currency: 'CAD',
    period: 'December 2024',
    status: 'scheduled',
    payment_date: '2024-12-15',
  },
  {
    id: 'pay_005',
    employee_id: 'emp_005',
    employee_name: 'Jordan Lee',
    amount: 6000.00,
    currency: 'GBP',
    period: 'December 2024',
    status: 'scheduled',
    payment_date: '2024-12-15',
  },
]

export async function getDeelData() {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const activeEmployees = mockEmployees.filter((e) => e.status === 'active')
  const contractors = mockEmployees.filter((e) => e.type === 'contractor')
  const fullTimeEmployees = mockEmployees.filter((e) => e.type === 'employee')
  const pendingOnboarding = mockEmployees.filter((e) => e.status === 'pending')

  const totalMonthlyPayroll = mockPayroll.reduce((sum, p) => sum + p.amount, 0)

  return {
    employees: mockEmployees,
    payroll: mockPayroll,
    stats: {
      totalEmployees: mockEmployees.length,
      activeEmployees: activeEmployees.length,
      contractors: contractors.length,
      fullTimeEmployees: fullTimeEmployees.length,
      pendingOnboarding: pendingOnboarding.length,
      totalMonthlyPayroll,
      countriesCount: new Set(mockEmployees.map((e) => e.country)).size,
    },
  }
}

