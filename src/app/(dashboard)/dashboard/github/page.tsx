import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getGitHubData } from '@/lib/mock-data'
import { GitBranch, GitPullRequest, GitCommit, Star, FolderGit2, Users } from 'lucide-react'

export default async function GitHubPage() {
  const { repos, commits, prs, stats } = await getGitHubData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <GitBranch className="h-8 w-8" />
          GitHub
        </h1>
        <p className="text-muted-foreground">
          Repository activity and development metrics
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRepos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openPRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commits This Week</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommitsThisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contributors}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Repositories */}
        <Card>
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>Your organization&apos;s repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repos.map((repo) => (
                <div key={repo.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{repo.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">{repo.stars}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{repo.open_issues} issues</span>
                    <span>{repo.forks} forks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pull Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pull Requests</CardTitle>
            <CardDescription>Recent pull requests across repos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prs.map((pr) => (
                <div key={pr.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={pr.author_avatar} />
                    <AvatarFallback>{pr.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pr.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pr.author} • {pr.repo}
                    </p>
                  </div>
                  <Badge
                    variant={pr.state === 'open' ? 'default' : pr.state === 'merged' ? 'secondary' : 'outline'}
                    className={pr.state === 'merged' ? 'bg-purple-500' : ''}
                  >
                    {pr.state}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Commits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commits</CardTitle>
          <CardDescription>Latest activity from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commits.map((commit) => (
              <div key={commit.sha} className="flex items-center gap-4 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={commit.author_avatar} />
                  <AvatarFallback>{commit.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{commit.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {commit.author} committed to {commit.repo}
                  </p>
                </div>
                <Badge variant="outline" className="font-mono">{commit.sha}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

