// User & Auth Types
export type UserRole = 'founder' | 'employee'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  organization_id: string
  position?: string
  department?: string
  manager_id?: string
  onboarding_completed: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  logo_url?: string
  created_at: string
  founder_id: string
}

// Org Chart Types
export interface OrgChartNode {
  id: string
  name: string
  position: string
  department: string
  avatar_url?: string
  manager_id?: string
  children?: OrgChartNode[]
}

// Onboarding Types
export interface OnboardingStep {
  id: string
  title: string
  description: string
  category: 'personal' | 'company' | 'tools' | 'team'
  order: number
  required: boolean
}

export interface UserOnboardingProgress {
  user_id: string
  step_id: string
  completed: boolean
  completed_at?: string
}

// Integration Types - GitHub
export interface GitHubRepo {
  id: string
  name: string
  full_name: string
  description: string
  stars: number
  forks: number
  open_issues: number
  last_updated: string
}

export interface GitHubCommit {
  sha: string
  message: string
  author: string
  author_avatar: string
  date: string
  repo: string
}

export interface GitHubPR {
  id: number
  title: string
  author: string
  author_avatar: string
  state: 'open' | 'closed' | 'merged'
  created_at: string
  repo: string
}

// Integration Types - Mercury
export interface MercuryAccount {
  id: string
  name: string
  type: 'checking' | 'savings'
  balance: number
  currency: string
}

export interface MercuryTransaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: 'credit' | 'debit'
  status: 'pending' | 'completed'
}

// Integration Types - QuickBooks
export interface QuickBooksInvoice {
  id: string
  customer_name: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  issued_date: string
}

export interface QuickBooksExpense {
  id: string
  vendor: string
  amount: number
  category: string
  date: string
  description: string
}

export interface QuickBooksPnL {
  period: string
  revenue: number
  expenses: number
  net_income: number
}

// Integration Types - Deel
export interface DeelEmployee {
  id: string
  name: string
  email: string
  type: 'employee' | 'contractor'
  country: string
  start_date: string
  salary?: number
  rate?: number
  status: 'active' | 'pending' | 'terminated'
}

export interface DeelPayroll {
  id: string
  employee_id: string
  employee_name: string
  amount: number
  currency: string
  period: string
  status: 'scheduled' | 'processing' | 'completed'
  payment_date: string
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalEmployees: number
  monthlyBurn: number
  runway: number
  bankBalance: number
  activeProjects: number
  openPRs: number
  pendingOnboarding: number
}

