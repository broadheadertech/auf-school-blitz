import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Plus, MapPin, Calendar, CheckCircle2, PackageSearch } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { CardSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const db = supabase as any

type PostType = 'lost' | 'found'
type PostStatus = 'open' | 'resolved'

interface LostFoundPost {
  id: string
  type: PostType
  title: string
  description: string
  location: string
  contact_info: string
  status: PostStatus
  created_by: string
  created_at: string
}

const STATUS_BADGE: Record<PostStatus, BadgeVariant> = {
  open: 'warning',
  resolved: 'success',
}

const TYPE_BADGE: Record<PostType, BadgeVariant> = {
  lost: 'error',
  found: 'info',
}

export default function LostFoundPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<LostFoundPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<PostType>('lost')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formType, setFormType] = useState<PostType>('lost')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formContact, setFormContact] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db
        .from('lost_found')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts(data ?? [])
    } catch {
      // Table may not exist yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  function resetForm() {
    setFormType('lost')
    setFormTitle('')
    setFormDescription('')
    setFormLocation('')
    setFormContact('')
    setShowForm(false)
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await db.from('lost_found').insert({
        type: formType,
        title: formTitle,
        description: formDescription,
        location: formLocation,
        contact_info: formContact,
        status: 'open',
        created_by: user.id,
      })
      resetForm()
      await fetchPosts()
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResolve(postId: string) {
    try {
      await db
        .from('lost_found')
        .update({ status: 'resolved' })
        .eq('id', postId)
      await fetchPosts()
    } catch {
      // Silently handle
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTab = p.type === activeTab
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [posts, activeTab, searchQuery])

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Lost & Found
        </h1>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-full bg-[var(--color-border)]" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-[var(--color-border)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Lost & Found
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none sm:w-56"
              aria-label="Search lost and found posts"
            />
          </div>
          <Button variant="accent" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['lost', 'found'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80'
            }`}
          >
            {tab === 'lost' ? 'Lost' : 'Found'}
            <span className="ml-1 text-xs">
              ({posts.filter((p) => p.type === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Post Form */}
      {showForm && (
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            New Post
          </h2>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            {/* Type selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Type
              </label>
              <div className="flex gap-2">
                {(['lost', 'found'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormType(type)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      formType === type
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {type === 'lost' ? 'I lost something' : 'I found something'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                placeholder="e.g. Blue Samsung Phone"
              />
              <Input
                label="Location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                required
                placeholder="e.g. Library 2nd Floor"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                required
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                placeholder="Describe the item in detail..."
              />
            </div>

            <Input
              label="Contact Info"
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              required
              placeholder="e.g. 09171234567 or email@school.edu.ph"
            />

            <div className="flex gap-2">
              <Button type="submit" loading={submitting}>
                Submit Post
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          icon={
            <PackageSearch className="h-7 w-7 text-[var(--color-text-secondary)]" />
          }
          title={`No ${activeTab} items`}
          description={
            searchQuery
              ? 'No posts match your search.'
              : `No ${activeTab} items have been posted yet. Click "Post" to add one.`
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const isOwner = post.created_by === user?.id

            return (
              <Card key={post.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={TYPE_BADGE[post.type]}
                      label={post.type === 'lost' ? 'Lost' : 'Found'}
                    />
                    <Badge
                      variant={STATUS_BADGE[post.status]}
                      label={
                        post.status === 'open' ? 'Open' : 'Resolved'
                      }
                    />
                  </div>
                </div>

                <h3 className="mt-2 font-display text-sm font-bold text-[var(--color-text-primary)]">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-3">
                  {post.description}
                </p>

                <div className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {post.location}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    {new Date(post.created_at).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {post.contact_info && post.status === 'open' && (
                  <p className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text-primary)]">
                    Contact: {post.contact_info}
                  </p>
                )}

                {/* Owner can resolve */}
                {isOwner && post.status === 'open' && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleResolve(post.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
