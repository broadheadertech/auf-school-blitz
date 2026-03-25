import { useState, useMemo } from 'react'
import { Calendar, MapPin, Clock, Users, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { CampusMap } from './components/campus-map'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CalendarEvent, EventCategory } from '@/types/database'
import { useEvents } from '@/hooks/use-supabase-query'

const CATEGORY_CONFIG: Record<EventCategory, { label: string; variant: BadgeVariant; color: string }> = {
  academic: { label: 'Academic', variant: 'info', color: '#3B82F6' },
  sports: { label: 'Sports', variant: 'error', color: '#EF4444' },
  cultural: { label: 'Cultural', variant: 'success', color: '#22C55E' },
  organization: { label: 'Organization', variant: 'warning', color: '#F59E0B' },
  administrative: { label: 'Administrative', variant: 'neutral', color: '#6B7280' },
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e01', title: 'Midterm Examinations', description: 'Midterm examination period for all programs.', category: 'academic', venue: 'All Classrooms', start_date: '2026-03-25T07:00:00Z', end_date: '2026-03-29T17:00:00Z', rsvp_enabled: false, max_attendees: null, created_at: '' },
  { id: 'e02', title: 'UAAP Basketball Finals Game 1', description: 'First game of the UAAP basketball finals series.', category: 'sports', venue: 'MOA Arena', start_date: '2026-04-05T16:00:00Z', end_date: '2026-04-05T19:00:00Z', rsvp_enabled: true, max_attendees: 200, created_at: '' },
  { id: 'e03', title: 'Cultural Night 2026', description: 'Annual celebration of Filipino heritage through dance, music, and cuisine.', category: 'cultural', venue: 'University Auditorium', start_date: '2026-04-12T18:00:00Z', end_date: '2026-04-12T22:00:00Z', rsvp_enabled: true, max_attendees: 500, created_at: '' },
  { id: 'e04', title: 'CS Department Hackathon', description: '24-hour hackathon open to all CS and IT students. Build something awesome!', category: 'organization', venue: 'Computer Lab 1-3', start_date: '2026-04-19T08:00:00Z', end_date: '2026-04-20T08:00:00Z', rsvp_enabled: true, max_attendees: 100, created_at: '' },
  { id: 'e05', title: 'Enrollment for 1st Sem AY 2026-2027', description: 'Online enrollment opens for all continuing students.', category: 'administrative', venue: 'Online via AUF Portal', start_date: '2026-05-05T00:00:00Z', end_date: '2026-05-20T23:59:00Z', rsvp_enabled: false, max_attendees: null, created_at: '' },
  { id: 'e06', title: 'Final Examinations', description: 'Final examination period for 2nd Semester.', category: 'academic', venue: 'All Classrooms', start_date: '2026-05-25T07:00:00Z', end_date: '2026-05-30T17:00:00Z', rsvp_enabled: false, max_attendees: null, created_at: '' },
  { id: 'e07', title: 'Commencement Exercises', description: 'Graduation ceremony for batch 2026.', category: 'administrative', venue: 'University Gymnasium', start_date: '2026-06-15T09:00:00Z', end_date: '2026-06-15T12:00:00Z', rsvp_enabled: false, max_attendees: null, created_at: '' },
]

export default function EventsPage() {
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all')
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set())

  const { events: liveEvents, loading } = useEvents()
  const allEvents: CalendarEvent[] = liveEvents.length > 0 ? liveEvents : MOCK_EVENTS

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Events</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />)}
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    const events = categoryFilter === 'all' ? allEvents : allEvents.filter((e) => e.category === categoryFilter)
    return events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  }, [categoryFilter])

  const toggleRsvp = (eventId: string) => {
    setRsvpIds((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return next
    })
  }

  // Build semester timeline
  const months = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of filtered) {
      const date = new Date(event.start_date)
      const key = date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
      const existing = map.get(key) ?? []
      existing.push(event)
      map.set(key, existing)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Events</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            2nd Sem AY 2025-2026
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === 'all' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategoryFilter(key as EventCategory)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === key ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Semester timeline */}
      {Array.from(months.entries()).map(([month, events]) => (
        <div key={month}>
          <h2 className="mb-3 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            {month}
          </h2>
          <div className="space-y-3">
            {events.map((event) => {
              const config = CATEGORY_CONFIG[event.category]
              const isRsvped = rsvpIds.has(event.id)
              const startDate = new Date(event.start_date)
              const endDate = new Date(event.end_date)
              const isSameDay = startDate.toDateString() === endDate.toDateString()

              return (
                <Card key={event.id} className="flex gap-4">
                  {/* Date badge */}
                  <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2 text-center" style={{ borderLeft: `3px solid ${config.color}` }}>
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {startDate.toLocaleDateString('en-PH', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">
                      {startDate.getDate()}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant} label={config.label} />
                    </div>
                    <h3 className="mt-1 font-display text-sm font-bold text-[var(--color-text-primary)]">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {event.description}
                    </p>
                    <CampusMap venue={event.venue} />
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {isSameDay
                          ? `${startDate.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
                          : `${startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {event.venue}
                      </span>
                      {event.max_attendees && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" aria-hidden="true" />
                          {event.max_attendees} spots
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RSVP */}
                  {event.rsvp_enabled && (
                    <div className="flex items-center">
                      <Button
                        variant={isRsvped ? 'secondary' : 'primary'}
                        onClick={() => toggleRsvp(event.id)}
                      >
                        {isRsvped ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            RSVP&apos;d
                          </>
                        ) : (
                          'RSVP'
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">No events found.</p>
        </Card>
      )}
    </div>
  )
}
