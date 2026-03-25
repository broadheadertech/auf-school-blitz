/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { Search, X, User, BookOpen, Newspaper, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

const db = supabase as any

interface SearchResult {
  type: 'student' | 'subject' | 'news' | 'event'
  id: string
  title: string
  subtitle: string
  link: string
}

const ICONS = {
  student: User,
  subject: BookOpen,
  news: Newspaper,
  event: Calendar,
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }
    const timeout = setTimeout(async () => {
      setSearching(true)
      const q = query.trim().toLowerCase()
      const items: SearchResult[] = []

      // Search students
      const { data: students } = await db.from('students').select('id, first_name, last_name, student_number, program').or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,student_number.ilike.%${q}%`).limit(5)
      for (const s of students ?? []) {
        items.push({ type: 'student', id: s.id, title: `${s.first_name} ${s.last_name}`, subtitle: `${s.student_number} — ${s.program}`, link: '/admin/users' })
      }

      // Search subjects
      const { data: subjects } = await db.from('subjects').select('id, code, name').or(`code.ilike.%${q}%,name.ilike.%${q}%`).limit(5)
      for (const s of subjects ?? []) {
        items.push({ type: 'subject', id: s.id, title: s.code, subtitle: s.name, link: '/curriculum' })
      }

      // Search news
      const { data: news } = await db.from('news_articles').select('id, title, category').ilike('title', `%${q}%`).limit(5)
      for (const n of news ?? []) {
        items.push({ type: 'news', id: n.id, title: n.title, subtitle: n.category, link: '/news' })
      }

      // Search events
      const { data: events } = await db.from('events').select('id, title, venue').ilike('title', `%${q}%`).limit(5)
      for (const e of events ?? []) {
        items.push({ type: 'event', id: e.id, title: e.title, subtitle: e.venue, link: '/events' })
      }

      setResults(items)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    navigate(result.link)
    setOpen(false)
    setQuery('')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-mono sm:inline">Ctrl+K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, subjects, news, events..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
          />
          <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-[var(--color-border)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {searching && <p className="px-3 py-4 text-center text-xs text-[var(--color-text-secondary)]">Searching...</p>}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-[var(--color-text-secondary)]">No results found</p>
          )}
          {results.map((r) => {
            const Icon = ICONS[r.type]
            return (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-bg)]"
              >
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{r.title}</p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{r.subtitle}</p>
                </div>
                <Badge variant="neutral" label={r.type} />
              </button>
            )
          })}
          {!query && (
            <p className="px-3 py-4 text-center text-xs text-[var(--color-text-secondary)]">
              Type at least 2 characters to search
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
