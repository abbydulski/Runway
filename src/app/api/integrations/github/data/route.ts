import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const GITHUB_ORG = 'advancedspade'

interface GitHubPR {
  id: number
  number: number
  title: string
  user: { login: string; avatar_url: string }
  created_at: string
  updated_at: string
  html_url: string
  state: string
  draft: boolean
  repository_url: string
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { name: string; date: string }
  }
  author: { login: string; avatar_url: string } | null
  html_url: string
  repository?: { name: string }
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  user: { login: string; avatar_url: string }
  created_at: string
  state: string
  html_url: string
  labels: { name: string; color: string }[]
  repository_url: string
}

interface GitHubContributor {
  login: string
  avatar_url: string
  contributions: number
}

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 })
  }

  // Get GitHub integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, provider_data')
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'github')
    .single()

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
  }

  const headers = {
    'Authorization': `Bearer ${integration.access_token}`,
    'Accept': 'application/vnd.github.v3+json',
  }

  try {
    // Fetch repos for the org
    const reposRes = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&sort=updated`, { headers })
    const repos = await reposRes.json()

    if (!Array.isArray(repos)) {
      console.error('GitHub repos error:', repos)
      return NextResponse.json({ error: 'Failed to fetch repos', details: repos }, { status: 400 })
    }

    // Fetch open PRs across all repos
    const prsPromises = repos.slice(0, 10).map(async (repo: { name: string }) => {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo.name}/pulls?state=open&per_page=10`, { headers })
      const prs = await res.json()
      return Array.isArray(prs) ? prs.map((pr: GitHubPR) => ({ ...pr, repo: repo.name })) : []
    })
    const prsArrays = await Promise.all(prsPromises)
    const openPRs = prsArrays.flat()

    // Fetch recent commits across repos
    const commitsPromises = repos.slice(0, 5).map(async (repo: { name: string }) => {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo.name}/commits?per_page=10`, { headers })
      const commits = await res.json()
      return Array.isArray(commits) ? commits.map((c: GitHubCommit) => ({ ...c, repo: repo.name })) : []
    })
    const commitsArrays = await Promise.all(commitsPromises)
    const recentCommits = commitsArrays.flat()
      .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
      .slice(0, 20)

    // Fetch open issues across repos
    const issuesPromises = repos.slice(0, 10).map(async (repo: { name: string }) => {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo.name}/issues?state=open&per_page=10`, { headers })
      const issues = await res.json()
      return Array.isArray(issues) ? issues.filter((i: GitHubIssue & { pull_request?: unknown }) => !i.pull_request).map((i: GitHubIssue) => ({ ...i, repo: repo.name })) : []
    })
    const issuesArrays = await Promise.all(issuesPromises)
    const openIssues = issuesArrays.flat()

    // Get contributors from top repos
    const contributorsMap = new Map<string, GitHubContributor>()
    const contribPromises = repos.slice(0, 5).map(async (repo: { name: string }) => {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo.name}/contributors?per_page=20`, { headers })
      const contributors = await res.json()
      if (Array.isArray(contributors)) {
        contributors.forEach((c: GitHubContributor) => {
          const existing = contributorsMap.get(c.login)
          if (existing) {
            existing.contributions += c.contributions
          } else {
            contributorsMap.set(c.login, { ...c })
          }
        })
      }
    })
    await Promise.all(contribPromises)
    const topContributors = Array.from(contributorsMap.values())
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 10)

    return NextResponse.json({
      org: GITHUB_ORG,
      stats: {
        totalRepos: repos.length,
        openPRs: openPRs.length,
        openIssues: openIssues.length,
        contributors: contributorsMap.size,
      },
      openPRs: openPRs.slice(0, 10),
      recentCommits,
      openIssues: openIssues.slice(0, 10),
      topContributors,
      repos: repos.slice(0, 10).map((r: { name: string; description: string; updated_at: string; stargazers_count: number }) => ({
        name: r.name,
        description: r.description,
        updated_at: r.updated_at,
        stars: r.stargazers_count,
      })),
    })
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}

