import { GitHubRepo, GitHubCommit, GitHubPR } from '@/types'

export const mockRepos: GitHubRepo[] = [
  {
    id: '1',
    name: 'runway-api',
    full_name: 'acme-startup/runway-api',
    description: 'Core API for the Runway platform',
    stars: 12,
    forks: 3,
    open_issues: 5,
    last_updated: '2024-12-09T14:30:00Z',
  },
  {
    id: '2',
    name: 'runway-web',
    full_name: 'acme-startup/runway-web',
    description: 'Web frontend for Runway',
    stars: 8,
    forks: 2,
    open_issues: 3,
    last_updated: '2024-12-10T09:15:00Z',
  },
  {
    id: '3',
    name: 'mobile-app',
    full_name: 'acme-startup/mobile-app',
    description: 'React Native mobile application',
    stars: 5,
    forks: 1,
    open_issues: 8,
    last_updated: '2024-12-08T16:45:00Z',
  },
]

export const mockCommits: GitHubCommit[] = [
  {
    sha: 'a1b2c3d',
    message: 'feat: add user authentication flow',
    author: 'Sarah Chen',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    date: '2024-12-10T10:30:00Z',
    repo: 'runway-api',
  },
  {
    sha: 'e4f5g6h',
    message: 'fix: resolve memory leak in dashboard',
    author: 'Marcus Johnson',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    date: '2024-12-10T09:15:00Z',
    repo: 'runway-web',
  },
  {
    sha: 'i7j8k9l',
    message: 'docs: update API documentation',
    author: 'Emily Rodriguez',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    date: '2024-12-09T16:45:00Z',
    repo: 'runway-api',
  },
  {
    sha: 'm0n1o2p',
    message: 'refactor: optimize database queries',
    author: 'Alex Kim',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    date: '2024-12-09T14:20:00Z',
    repo: 'runway-api',
  },
  {
    sha: 'q3r4s5t',
    message: 'feat: implement dark mode toggle',
    author: 'Jordan Lee',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    date: '2024-12-09T11:00:00Z',
    repo: 'runway-web',
  },
]

export const mockPRs: GitHubPR[] = [
  {
    id: 101,
    title: 'Add OAuth2 integration with Google',
    author: 'Sarah Chen',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    state: 'open',
    created_at: '2024-12-09T08:00:00Z',
    repo: 'runway-api',
  },
  {
    id: 102,
    title: 'Implement real-time notifications',
    author: 'Marcus Johnson',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    state: 'open',
    created_at: '2024-12-08T14:30:00Z',
    repo: 'runway-web',
  },
  {
    id: 103,
    title: 'Fix responsive layout issues',
    author: 'Emily Rodriguez',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    state: 'merged',
    created_at: '2024-12-07T10:00:00Z',
    repo: 'runway-web',
  },
  {
    id: 104,
    title: 'Add unit tests for auth module',
    author: 'Alex Kim',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    state: 'open',
    created_at: '2024-12-10T07:45:00Z',
    repo: 'runway-api',
  },
]

export async function getGitHubData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    repos: mockRepos,
    commits: mockCommits,
    prs: mockPRs,
    stats: {
      totalRepos: mockRepos.length,
      openPRs: mockPRs.filter((pr) => pr.state === 'open').length,
      totalCommitsThisWeek: mockCommits.length,
      contributors: 5,
    },
  }
}

