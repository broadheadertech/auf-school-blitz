import { useState, useMemo } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { NewsArticle, NewsCategory } from '@/types/database'
import { NewsDigest } from './components/news-digest'
import { useNews } from '@/hooks/use-supabase-query'

const CATEGORIES: NewsCategory[] = ['Academic', 'Administrative', 'Campus Life', 'Sports', 'International']

const categoryBadge: Record<NewsCategory, BadgeVariant> = {
  Academic: 'info',
  Administrative: 'warning',
  'Campus Life': 'success',
  Sports: 'error',
  International: 'neutral',
}

const MOCK_NEWS: NewsArticle[] = [
  { id: 'n01', title: 'ASU Portal Launches New Online Enrollment System', excerpt: 'Students can now enroll using a schedule-first approach with automatic conflict detection.', body: 'The university is proud to announce the launch of ASU Portal, a modern web application that revolutionizes the enrollment process. Students can now define their preferred schedule first, and the system will automatically show only subjects that fit.\n\nThe new system includes features like:\n- Schedule-first enrollment with drag-and-drop preferences\n- Automatic conflict detection\n- Real-time seat availability\n- One-tap enrollment confirmation\n\nThe system was developed by the IT department in collaboration with the Office of the Registrar.', category: 'Academic', thumbnail_url: null, author_name: 'Office of the Registrar', is_featured: true, published_at: '2026-03-15T08:00:00Z', created_at: '2026-03-15T08:00:00Z' },
  { id: 'n02', title: 'Midterm Examination Schedule Released', excerpt: 'The midterm examination period for 2nd Semester AY 2025-2026 has been announced.', body: 'The midterm examinations will be held from March 25-29, 2026. Students are advised to check their exam schedules on ASU Portal.\n\nKey reminders:\n- Bring your student ID to all exams\n- No electronic devices allowed in the examination room\n- Late students will not be admitted after 15 minutes', category: 'Academic', thumbnail_url: null, author_name: 'Academic Affairs', is_featured: false, published_at: '2026-03-12T10:00:00Z', created_at: '2026-03-12T10:00:00Z' },
  { id: 'n03', title: 'Payment Deadline Extended to March 31', excerpt: 'The deadline for 2nd semester tuition payment has been extended by two weeks.', body: 'In response to student requests, the Finance Office has extended the payment deadline to March 31, 2026. Students with outstanding balances should settle their accounts before the new deadline to avoid late penalties.', category: 'Administrative', thumbnail_url: null, author_name: 'Finance Office', is_featured: false, published_at: '2026-03-10T14:00:00Z', created_at: '2026-03-10T14:00:00Z' },
  { id: 'n04', title: 'University Basketball Team Advances to Finals', excerpt: 'The Wildcats defeated their rivals in a thrilling semifinal match.', body: 'The university basketball team has advanced to the UAAP finals after a dramatic 85-82 victory. The team will face their longtime rivals in a best-of-three series starting April 5.', category: 'Sports', thumbnail_url: null, author_name: 'Sports Office', is_featured: false, published_at: '2026-03-08T18:00:00Z', created_at: '2026-03-08T18:00:00Z' },
  { id: 'n05', title: 'Cultural Night 2026: Celebrating Filipino Heritage', excerpt: 'Join us for an evening of Filipino performances, food, and art at the annual Cultural Night.', body: 'The Student Affairs Office invites everyone to Cultural Night 2026, celebrating Filipino heritage through dance, music, and cuisine. The event features performances from various student organizations and a food bazaar.\n\nDate: April 12, 2026\nVenue: University Auditorium\nTime: 6:00 PM\nAdmission: Free', category: 'Campus Life', thumbnail_url: null, author_name: 'Student Affairs', is_featured: false, published_at: '2026-03-05T09:00:00Z', created_at: '2026-03-05T09:00:00Z' },
  { id: 'n06', title: 'International Exchange Program Applications Now Open', excerpt: 'Students can apply for semester-long exchange programs at partner universities abroad.', body: 'The Office of International Affairs is now accepting applications for the 2026-2027 exchange program. Partner universities include institutions in Japan, South Korea, Australia, and the United States.\n\nApplication deadline: April 30, 2026\nEligibility: 3rd year students with GWA of 2.0 or better', category: 'International', thumbnail_url: null, author_name: 'International Affairs', is_featured: false, published_at: '2026-03-01T07:00:00Z', created_at: '2026-03-01T07:00:00Z' },
]

export default function NewsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

  const { articles: liveNews, loading } = useNews()
  const allNews: NewsArticle[] = liveNews.length > 0 ? liveNews : MOCK_NEWS

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>School News</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />)}
          </div>
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    return allNews.filter((n) => {
      const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter
      const matchesSearch = !search.trim() || n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, categoryFilter])

  const featured = filtered.find((n) => n.is_featured)
  const rest = filtered.filter((n) => !n.is_featured)

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => setSelectedArticle(null)}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to News
        </Button>
        <article>
          <Badge variant={categoryBadge[selectedArticle.category]} label={selectedArticle.category} />
          <h1 className="mt-2">{selectedArticle.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            By {selectedArticle.author_name} — {new Date(selectedArticle.published_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <Card className="mt-4">
            {selectedArticle.body.split('\n').map((paragraph, i) => (
              <p key={i} className={`text-sm text-[var(--color-text-primary)] ${i > 0 ? 'mt-3' : ''}`}>
                {paragraph}
              </p>
            ))}
          </Card>
        </article>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1>School News</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === 'all' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80'}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === cat ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI Digest */}
      <NewsDigest onSelectArticle={(id) => {
        const article = MOCK_NEWS.find((n) => n.id === id)
        if (article) setSelectedArticle(article)
      }} />

      {/* Featured hero */}
      {featured && (
        <button type="button" onClick={() => setSelectedArticle(featured)} className="block w-full text-left">
          <Card className="border-l-4 border-l-[var(--color-accent)]">
            <Badge variant={categoryBadge[featured.category]} label={featured.category} />
            <h2 className="mt-2 font-display text-xl font-bold text-[var(--color-text-primary)]">
              {featured.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{featured.excerpt}</p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              {featured.author_name} — {new Date(featured.published_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </Card>
        </button>
      )}

      {/* Article list */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <button key={article.id} type="button" onClick={() => setSelectedArticle(article)} className="block w-full text-left">
            <Card className="h-full hover:shadow-md transition-shadow">
              <Badge variant={categoryBadge[article.category]} label={article.category} />
              <h3 className="mt-2 font-display text-sm font-bold text-[var(--color-text-primary)] line-clamp-2">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                {article.excerpt}
              </p>
              <p className="mt-2 text-[10px] text-[var(--color-text-secondary)]">
                {new Date(article.published_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              </p>
            </Card>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-[var(--color-text-secondary)]">No news articles found.</p>
        </Card>
      )}
    </div>
  )
}
