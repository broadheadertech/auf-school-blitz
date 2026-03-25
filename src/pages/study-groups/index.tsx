import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, LogIn, LogOut, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { CardSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const db = supabase as any

interface Section {
  id: string
  name: string
  subject_name?: string
}

interface StudyGroup {
  id: string
  section_id: string
  name: string
  description: string
  max_members: number
  created_by: string
  created_at: string
}

interface StudyGroupMember {
  id: string
  study_group_id: string
  user_id: string
  member_name: string
  joined_at: string
}

export default function StudyGroupsPage() {
  const { user, profile } = useAuthStore()
  const [sections, setSections] = useState<Section[]>([])
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [members, setMembers] = useState<StudyGroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [creatingForSection, setCreatingForSection] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formMaxMembers, setFormMaxMembers] = useState('10')

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch enrolled sections for the student
      const { data: enrollments } = await db
        .from('enrollments')
        .select('section_id')
        .eq('student_id', user.id)

      const sectionIds = (enrollments ?? []).map((e: any) => e.section_id)

      if (sectionIds.length > 0) {
        const { data: sectionData } = await db
          .from('sections')
          .select('id, name, subject_name')
          .in('id', sectionIds)
        setSections(sectionData ?? [])

        // Fetch study groups for these sections
        const { data: groupData } = await db
          .from('study_groups')
          .select('*')
          .in('section_id', sectionIds)
          .order('created_at', { ascending: false })
        setGroups(groupData ?? [])

        // Fetch members for all groups
        const groupIds = (groupData ?? []).map((g: any) => g.id)
        if (groupIds.length > 0) {
          const { data: memberData } = await db
            .from('study_group_members')
            .select('*')
            .in('study_group_id', groupIds)
          setMembers(memberData ?? [])
        }
      } else {
        setSections([])
        setGroups([])
        setMembers([])
      }
    } catch {
      // Tables may not exist yet
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function getUserDisplayName(): string {
    if (profile) {
      const p = profile as any
      if (p.first_name) return `${p.first_name} ${p.last_name ?? ''}`.trim()
    }
    return user?.email ?? 'Student'
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !creatingForSection) return
    setSubmitting(true)
    try {
      // Insert group
      const { data: newGroup } = await db
        .from('study_groups')
        .insert({
          section_id: creatingForSection,
          name: formName,
          description: formDescription,
          max_members: parseInt(formMaxMembers),
          created_by: user.id,
        })
        .select()
        .single()

      // Add creator as member
      if (newGroup) {
        await db.from('study_group_members').insert({
          study_group_id: newGroup.id,
          user_id: user.id,
          member_name: getUserDisplayName(),
        })
      }

      setCreatingForSection(null)
      setFormName('')
      setFormDescription('')
      setFormMaxMembers('10')
      await fetchData()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin(groupId: string) {
    if (!user) return
    setSubmitting(true)
    try {
      await db.from('study_group_members').insert({
        study_group_id: groupId,
        user_id: user.id,
        member_name: getUserDisplayName(),
      })
      await fetchData()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeave(groupId: string) {
    if (!user) return
    setSubmitting(true)
    try {
      await db
        .from('study_group_members')
        .delete()
        .eq('study_group_id', groupId)
        .eq('user_id', user.id)
      await fetchData()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  function getGroupMembers(groupId: string): StudyGroupMember[] {
    return members.filter((m) => m.study_group_id === groupId)
  }

  function isMember(groupId: string): boolean {
    return members.some(
      (m) => m.study_group_id === groupId && m.user_id === user?.id,
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Study Groups
        </h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-border)]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Study Groups
        </h1>
        <EmptyState
          icon={<Users className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No enrolled sections"
          description="Enroll in sections first to create or join study groups."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Study Groups
        </h1>
      </div>

      {/* Sections with groups */}
      {sections.map((section) => {
        const sectionGroups = groups.filter(
          (g) => g.section_id === section.id,
        )
        const isCreating = creatingForSection === section.id

        return (
          <div key={section.id}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                {section.subject_name ?? section.name}
                <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
                  ({section.name})
                </span>
              </h2>
              {!isCreating && (
                <Button
                  variant="ghost"
                  onClick={() => setCreatingForSection(section.id)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create Group
                </Button>
              )}
            </div>

            {/* Create group form */}
            {isCreating && (
              <Card className="mb-3">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  Create Study Group
                </h3>
                <form onSubmit={handleCreateGroup} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Group Name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="e.g. Data Structures Review"
                    />
                    <Input
                      label="Max Members"
                      type="number"
                      min="2"
                      max="50"
                      value={formMaxMembers}
                      onChange={(e) => setFormMaxMembers(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                      placeholder="What will you study together?"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" loading={submitting}>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Create & Join
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreatingForSection(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Groups list */}
            {sectionGroups.length === 0 ? (
              <Card className="text-center py-6">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No study groups yet for this section. Be the first to create one!
                </p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sectionGroups.map((group) => {
                  const groupMembers = getGroupMembers(group.id)
                  const memberOfGroup = isMember(group.id)
                  const isFull = groupMembers.length >= group.max_members

                  return (
                    <Card key={group.id}>
                      <div className="flex items-start justify-between">
                        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                          {group.name}
                        </h3>
                        <Badge
                          variant={isFull ? 'error' : 'success'}
                          label={`${groupMembers.length}/${group.max_members}`}
                        />
                      </div>
                      {group.description && (
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      {/* Members */}
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                          Members
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {groupMembers.map((m) => (
                            <span
                              key={m.id}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                m.user_id === user?.id
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                              }`}
                            >
                              {m.member_name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Join / Leave */}
                      <div className="mt-3">
                        {memberOfGroup ? (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleLeave(group.id)}
                            loading={submitting}
                          >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Leave
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full"
                            disabled={isFull}
                            onClick={() => handleJoin(group.id)}
                            loading={submitting}
                          >
                            <LogIn className="h-4 w-4" aria-hidden="true" />
                            {isFull ? 'Full' : 'Join'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
