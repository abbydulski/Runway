export * from './github'
export * from './mercury'
export * from './quickbooks'
export * from './deel'
export * from './org-chart'

import { getGitHubData } from './github'
import { getMercuryData } from './mercury'
import { getQuickBooksData } from './quickbooks'
import { getDeelData } from './deel'
import { getOrgChartData } from './org-chart'
import { DashboardMetrics } from '@/types'

export async function getAllDashboardData() {
  const [github, mercury, quickbooks, deel, orgChart] = await Promise.all([
    getGitHubData(),
    getMercuryData(),
    getQuickBooksData(),
    getDeelData(),
    getOrgChartData(),
  ])

  const metrics: DashboardMetrics = {
    totalEmployees: deel.stats.totalEmployees,
    monthlyBurn: mercury.stats.monthlySpend,
    runway: mercury.stats.runway,
    bankBalance: mercury.stats.totalBalance,
    activeProjects: github.stats.totalRepos,
    openPRs: github.stats.openPRs,
    pendingOnboarding: deel.stats.pendingOnboarding,
  }

  return {
    github,
    mercury,
    quickbooks,
    deel,
    orgChart,
    metrics,
  }
}

