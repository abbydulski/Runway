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
  team_id?: string
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
  organization_id: string
  title: string
  description: string
  category: 'personal' | 'company' | 'tools' | 'team'
  step_type: 'integration' | 'manual' | 'document'
  integration_provider?: IntegrationProvider
  document_url?: string
  order_index: number
  is_enabled: boolean
  is_required: boolean
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

// Teams
export interface Team {
  id: string
  organization_id: string
  name: string
  description?: string
  slack_config: SlackTeamConfig
  github_config: GitHubTeamConfig
  deel_config: DeelTeamConfig
  created_at: string
  updated_at: string
}

export interface SlackTeamConfig {
  channels: string[]
}

export interface GitHubTeamConfig {
  teams: string[]
}

export interface DeelTeamConfig {
  contract_type: 'contractor' | 'employee'
  payment_schedule: 'weekly' | 'biweekly' | 'monthly'
}

// Integrations
export type IntegrationProvider = 'slack' | 'github' | 'deel' | 'quickbooks' | 'google_workspace' | 'notion' | 'linear'

export interface Integration {
  id: string
  organization_id: string
  provider: IntegrationProvider
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  provider_data: Record<string, unknown>
  config?: Record<string, unknown>
  is_active: boolean
  connected_at: string
  connected_by: string
}

// Invites (updated)
export interface Invite {
  id: string
  email: string
  organization_id: string
  team_id?: string
  manager_id?: string
  position?: string
  status: 'pending' | 'accepted' | 'expired'
  invite_token: string
  invited_by: string
  accepted_at?: string
  created_at: string
}

// Provisioning Logs
export type ProvisioningStatus = 'pending' | 'success' | 'failed'

export interface ProvisioningLog {
  id: string
  user_id: string
  organization_id: string
  provider: IntegrationProvider
  action: string
  status: ProvisioningStatus
  error_message?: string
  provider_response?: Record<string, unknown>
  created_at: string
}

