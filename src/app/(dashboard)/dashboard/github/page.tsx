'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CircleDot,
} from 'lucide-react'
import Link from 'next/link'

interface GitHubData {
  org: string
  stats: {
    totalRepos: number
    openPRs: number
    openIssues: number
    contributors: number
  }
  openPRs: Array<{
    id: number
    number: number
    title: string
    user: { login: string; avatar_url: string }
    created_at: string
    html_url: string
    draft: boolean
    repo: string
  }>
  recentCommits: Array<{
    sha: string
    commit: { message: string; author: { name: string; date: string } }
    author: { login: string; avatar_url: string } | null
    html_url: string
    repo: string
  }>
  openIssues: Array<{
    id: number
    number: number
    title: string
    user: { login: string; avatar_url: string }
    created_at: string
    html_url: string
    labels: { name: string; color: string }[]
    repo: string
  }>
  topContributors: Array<{
    login: string
    avatar_url: string
    contributions: number
  }>
  repos: Array<{
    name: string
    description: string
    updated_at: string
    stars: number
  }>
}

export default function GitHubPage() {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/integrations/github/data')
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to fetch')
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError('Failed to fetch GitHub data')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            GitHub
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            GitHub
          </h1>
          <p className="text-muted-foreground">Repository activity and development metrics</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Required</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your GitHub account to see data from the Advanced Spade organization.
            </p>
            <Button asChild>
              <Link href="/dashboard/integrations">
                <GitBranch className="mr-2 h-4 w-4" />
                Connect GitHub
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            GitHub — {data?.org}
          </h1>
          <p className="text-muted-foreground">
            Repository activity and development metrics
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalRepos || 0}</div>
            <p className="text-xs text-muted-foreground">Total repos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.openPRs || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.openIssues || 0}</div>
            <p className="text-xs text-muted-foreground">To be resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.contributors || 0}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Open PRs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Open Pull Requests
            </CardTitle>
            <CardDescription>PRs awaiting review or merge</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.openPRs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open PRs</p>
            ) : (
              <div className="space-y-3">
                {data?.openPRs.map(pr => (
                  <a
                    key={pr.id}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={pr.user.avatar_url} />
                      <AvatarFallback>{pr.user.login[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        #{pr.number} • {pr.repo} • {pr.user.login} • {timeAgo(pr.created_at)}
                      </p>
                    </div>
                    {pr.draft && <Badge variant="secondary">Draft</Badge>}
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </CardTitle>
            <CardDescription>Latest activity across repos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentCommits.slice(0, 8).map(commit => (
                <a
                  key={commit.sha}
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commit.author?.avatar_url} />
                    <AvatarFallback>{commit.commit.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{commit.commit.message.split('\n')[0]}</p>
                    <p className="text-xs text-muted-foreground">
                      {commit.repo} • {commit.author?.login || commit.commit.author.name} • {timeAgo(commit.commit.author.date)}
                    </p>
                  </div>
                  <code className="text-xs text-muted-foreground">{commit.sha.slice(0, 7)}</code>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDot className="h-5 w-5" />
              Open Issues
            </CardTitle>
            <CardDescription>Issues to be resolved</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.openIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open issues</p>
            ) : (
              <div className="space-y-3">
                {data?.openIssues.slice(0, 6).map(issue => (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={issue.user.avatar_url} />
                      <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">
                        #{issue.number} • {issue.repo} • {timeAgo(issue.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {issue.labels.slice(0, 2).map(label => (
                        <Badge
                          key={label.name}
                          variant="outline"
                          style={{ borderColor: `#${label.color}`, color: `#${label.color}` }}
                          className="text-xs"
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Contributors
            </CardTitle>
            <CardDescription>Most active team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topContributors.map((contributor, i) => (
                <div
                  key={contributor.login}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <span className="text-sm font-medium text-muted-foreground w-4">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar_url} />
                    <AvatarFallback>{contributor.login[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{contributor.login}</p>
                  </div>
                  <Badge variant="secondary">{contributor.contributions} commits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

