'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Users, Slack, Github, Briefcase } from 'lucide-react'
import type { Team } from '@/types'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slack_channels: '',
    github_teams: '',
    contract_type: 'contractor' as 'contractor' | 'employee',
  })
  const supabase = createClient()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setTeams(data)
    }
    setLoading(false)
  }

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const teamData = {
      name: formData.name,
      description: formData.description || null,
      organization_id: profile.organization_id,
      slack_config: { channels: formData.slack_channels.split(',').map(c => c.trim()).filter(Boolean) },
      github_config: { teams: formData.github_teams.split(',').map(t => t.trim()).filter(Boolean) },
      deel_config: { contract_type: formData.contract_type, payment_schedule: 'monthly' as const },
    }

    if (editingTeam) {
      await supabase.from('teams').update(teamData).eq('id', editingTeam.id)
    } else {
      await supabase.from('teams').insert(teamData)
    }

    resetForm()
    fetchTeams()
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this team?')) {
      await supabase.from('teams').delete().eq('id', id)
      fetchTeams()
    }
  }

  function resetForm() {
    setFormData({ name: '', description: '', slack_channels: '', github_teams: '', contract_type: 'contractor' })
    setEditingTeam(null)
    setIsCreateOpen(false)
  }

  function openEdit(team: Team) {
    setFormData({
      name: team.name,
      description: team.description || '',
      slack_channels: team.slack_config.channels.join(', '),
      github_teams: team.github_config.teams.join(', '),
      contract_type: team.deel_config.contract_type,
    })
    setEditingTeam(team)
    setIsCreateOpen(true)
  }

  if (loading) {
    return <div className="p-8">Loading teams...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams Setup</h1>
          <p className="text-muted-foreground">Configure teams and their integration settings</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsCreateOpen(open) }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
              <DialogDescription>Configure team details and integration settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Engineering" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack">Slack Channels</Label>
                <Input id="slack" value={formData.slack_channels} onChange={(e) => setFormData({ ...formData, slack_channels: e.target.value })} placeholder="#general, #engineering" />
                <p className="text-xs text-muted-foreground">Comma-separated list of channels to add new members to</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Teams</Label>
                <Input id="github" value={formData.github_teams} onChange={(e) => setFormData({ ...formData, github_teams: e.target.value })} placeholder="engineers, developers" />
                <p className="text-xs text-muted-foreground">Comma-separated list of GitHub teams</p>
              </div>
              <div className="space-y-2">
                <Label>Deel Contract Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.contract_type === 'contractor'} onChange={() => setFormData({ ...formData, contract_type: 'contractor' })} />
                    Contractor
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.contract_type === 'employee'} onChange={() => setFormData({ ...formData, contract_type: 'employee' })} />
                    Employee
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>{editingTeam ? 'Save Changes' : 'Create Team'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">Create your first team to start configuring integrations</p>
            <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Team</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onEdit={() => openEdit(team)} onDelete={() => handleDelete(team.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, onEdit, onDelete }: { team: Team; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{team.name}</CardTitle>
            {team.description && <CardDescription>{team.description}</CardDescription>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Slack className="h-4 w-4 text-muted-foreground" />
          {team.slack_config.channels.length > 0 ? team.slack_config.channels.map(c => <Badge key={c} variant="secondary">{c}</Badge>) : <span className="text-muted-foreground">No channels</span>}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Github className="h-4 w-4 text-muted-foreground" />
          {team.github_config.teams.length > 0 ? team.github_config.teams.map(t => <Badge key={t} variant="secondary">{t}</Badge>) : <span className="text-muted-foreground">No teams</span>}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{team.deel_config.contract_type}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

