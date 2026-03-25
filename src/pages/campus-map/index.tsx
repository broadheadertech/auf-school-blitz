import { useState } from 'react'
import { MapPin, Building2, BookOpen, Dumbbell, FlaskConical, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CampusBuilding {
  id: string
  name: string
  code: string
  type: 'academic' | 'admin' | 'facility' | 'sports' | 'lab'
  floors: number
  rooms: string[]
  description: string
  x: number // percentage position
  y: number
}

const BUILDINGS: CampusBuilding[] = [
  { id: 'b1', name: 'Main Academic Building', code: 'MAB', type: 'academic', floors: 4, rooms: ['Room 101-110', 'Room 201-210', 'Room 301-310', 'Room 401-410'], description: 'General education and lecture rooms', x: 30, y: 25 },
  { id: 'b2', name: 'Science Building', code: 'SB', type: 'lab', floors: 3, rooms: ['Lab 1-3', 'Room 201-205', 'Room 301-305'], description: 'Science labs and classrooms', x: 55, y: 20 },
  { id: 'b3', name: 'Computer Science Building', code: 'CSB', type: 'lab', floors: 3, rooms: ['Computer Lab 1-4', 'Room 201-203', 'Room 301-303'], description: 'CS/IT department and computer labs', x: 70, y: 35 },
  { id: 'b4', name: 'Administration Building', code: 'ADMIN', type: 'admin', floors: 2, rooms: ['Registrar', 'Finance Office', 'Student Affairs', 'Dean\'s Office'], description: 'Administrative offices', x: 20, y: 50 },
  { id: 'b5', name: 'University Gymnasium', code: 'GYM', type: 'sports', floors: 1, rooms: ['Main Court', 'Gym', 'Locker Rooms'], description: 'Sports and PE activities', x: 75, y: 60 },
  { id: 'b6', name: 'University Auditorium', code: 'AUD', type: 'facility', floors: 1, rooms: ['Auditorium', 'Stage', 'Backstage'], description: 'Events and assemblies', x: 45, y: 55 },
  { id: 'b7', name: 'Library', code: 'LIB', type: 'academic', floors: 3, rooms: ['Reading Area', 'Reference Section', 'Digital Library', 'Study Rooms'], description: 'University library and study spaces', x: 40, y: 35 },
  { id: 'b8', name: 'Student Center', code: 'SC', type: 'facility', floors: 2, rooms: ['Cafeteria', 'Student Lounge', 'Org Offices'], description: 'Student services and food court', x: 50, y: 70 },
  { id: 'b9', name: 'Nursing Building', code: 'NB', type: 'lab', floors: 3, rooms: ['Simulation Lab', 'Skills Lab', 'Lecture Rooms'], description: 'College of Nursing', x: 25, y: 75 },
]

const TYPE_CONFIG: Record<string, { icon: typeof Building2; color: string }> = {
  academic: { icon: BookOpen, color: 'var(--color-primary)' },
  admin: { icon: Building2, color: 'var(--color-accent)' },
  facility: { icon: Users, color: 'var(--color-success)' },
  sports: { icon: Dumbbell, color: 'var(--color-error)' },
  lab: { icon: FlaskConical, color: 'var(--color-info)' },
}

export default function CampusMapPage() {
  const [selected, setSelected] = useState<CampusBuilding | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = BUILDINGS.filter((b) => {
    if (filter !== 'all' && b.type !== filter) return false
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1>Campus Map</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Find buildings, rooms, and facilities</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buildings..."
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        />
        {['all', 'academic', 'lab', 'admin', 'sports', 'facility'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Map */}
        <Card className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          {/* Roads */}
          <div className="absolute top-[45%] left-[5%] right-[5%] h-1 bg-gray-300 rounded" />
          <div className="absolute top-[5%] bottom-[5%] left-[45%] w-1 bg-gray-300 rounded" />

          {/* Building pins */}
          {filtered.map((b) => {
            const config = TYPE_CONFIG[b.type]!
            const isSelected = selected?.id === b.id
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b)}
                className={`absolute flex flex-col items-center transition-transform ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                title={b.name}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${isSelected ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
                  style={{ backgroundColor: config.color }}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="mt-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-gray-700 shadow-sm">
                  {b.code}
                </span>
              </button>
            )
          })}
        </Card>

        {/* Building detail / list */}
        <div className="space-y-3">
          {selected ? (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">{selected.name}</h2>
                <button type="button" onClick={() => setSelected(null)} className="text-xs text-[var(--color-accent)] hover:underline">Close</button>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge variant="info" label={selected.code} />
                <Badge variant="neutral" label={`${selected.floors} floor${selected.floors > 1 ? 's' : ''}`} />
                <Badge variant="success" label={selected.type} />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{selected.description}</p>
              <h3 className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Rooms & Facilities</h3>
              <ul className="space-y-1">
                {selected.rooms.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <div className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)]">Click a building on the map to see details</p>
          )}

          {/* Building list */}
          <div className="space-y-2">
            {filtered.map((b) => {
              const config = TYPE_CONFIG[b.type]!
              const Icon = config.icon
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors hover:bg-[var(--color-bg)] ${selected?.id === b.id ? 'ring-1 ring-[var(--color-accent)]' : ''}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{b.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{b.code} — {b.floors}F</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
