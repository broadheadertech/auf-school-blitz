import { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CampusMapProps {
  venue: string
}

// Simple venue-to-coordinate mapping for the campus SVG
const VENUE_POSITIONS: Record<string, { x: number; y: number }> = {
  'Room 301': { x: 30, y: 25 },
  'Room 302': { x: 35, y: 25 },
  'Room 201': { x: 30, y: 40 },
  'Room 203': { x: 35, y: 40 },
  'Room 101': { x: 30, y: 55 },
  'Computer Lab 1-3': { x: 55, y: 25 },
  'Auditorium': { x: 70, y: 40 },
  'Gym': { x: 70, y: 60 },
  'University Auditorium': { x: 70, y: 40 },
  'University Gymnasium': { x: 70, y: 60 },
  'MOA Arena': { x: 50, y: 50 }, // Off-campus
  'All Classrooms': { x: 35, y: 40 },
}

export function CampusMap({ venue }: CampusMapProps) {
  const [expanded, setExpanded] = useState(false)
  const pos = VENUE_POSITIONS[venue]

  if (!pos || venue === 'Online via UniPortal') return null

  const MiniMap = () => (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="relative h-24 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] hover:shadow-sm transition-shadow"
      aria-label={`View campus map for ${venue}`}
    >
      {/* Simplified campus SVG */}
      <svg viewBox="0 0 100 80" className="h-full w-full">
        {/* Buildings */}
        <rect x="20" y="15" width="25" height="20" rx="2" fill="var(--color-border)" />
        <text x="32.5" y="27" textAnchor="middle" fontSize="3" fill="var(--color-text-secondary)">Academic</text>
        <rect x="20" y="40" width="25" height="15" rx="2" fill="var(--color-border)" />
        <text x="32.5" y="49" textAnchor="middle" fontSize="3" fill="var(--color-text-secondary)">Science</text>
        <rect x="50" y="15" width="20" height="15" rx="2" fill="var(--color-border)" />
        <text x="60" y="24" textAnchor="middle" fontSize="3" fill="var(--color-text-secondary)">IT Lab</text>
        <rect x="55" y="35" width="25" height="15" rx="2" fill="var(--color-border)" />
        <text x="67.5" y="44" textAnchor="middle" fontSize="3" fill="var(--color-text-secondary)">Auditorium</text>
        <rect x="55" y="55" width="25" height="15" rx="2" fill="var(--color-border)" />
        <text x="67.5" y="64" textAnchor="middle" fontSize="3" fill="var(--color-text-secondary)">Gym</text>
        {/* Venue pin */}
        <circle cx={pos.x} cy={pos.y} r="3" fill="#EF4444" stroke="white" strokeWidth="1" />
      </svg>
      <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-[var(--color-surface)]/90 px-1.5 py-0.5 text-[9px] text-[var(--color-text-secondary)]">
        <MapPin className="h-2.5 w-2.5" />
        {venue}
      </div>
    </button>
  )

  if (!expanded) return <MiniMap />

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Campus map">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            Campus Map — {venue}
          </h3>
          <button type="button" onClick={() => setExpanded(false)} className="p-1 hover:bg-[var(--color-border)] rounded-[var(--radius-md)]" aria-label="Close map">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <svg viewBox="0 0 100 80" className="h-64 w-full">
            <rect x="20" y="15" width="25" height="20" rx="2" fill="var(--color-border)" />
            <text x="32.5" y="23" textAnchor="middle" fontSize="2.5" fill="var(--color-text-secondary)">Academic Bldg</text>
            <text x="32.5" y="27" textAnchor="middle" fontSize="2" fill="var(--color-text-secondary)">Rooms 301-305</text>
            <rect x="20" y="40" width="25" height="15" rx="2" fill="var(--color-border)" />
            <text x="32.5" y="48" textAnchor="middle" fontSize="2.5" fill="var(--color-text-secondary)">Science Bldg</text>
            <text x="32.5" y="52" textAnchor="middle" fontSize="2" fill="var(--color-text-secondary)">Rooms 101-203</text>
            <rect x="50" y="15" width="20" height="15" rx="2" fill="var(--color-border)" />
            <text x="60" y="23" textAnchor="middle" fontSize="2.5" fill="var(--color-text-secondary)">IT Laboratory</text>
            <text x="60" y="27" textAnchor="middle" fontSize="2" fill="var(--color-text-secondary)">Comp Labs 1-3</text>
            <rect x="55" y="35" width="25" height="15" rx="2" fill="var(--color-border)" />
            <text x="67.5" y="43" textAnchor="middle" fontSize="2.5" fill="var(--color-text-secondary)">Auditorium</text>
            <rect x="55" y="55" width="25" height="15" rx="2" fill="var(--color-border)" />
            <text x="67.5" y="63" textAnchor="middle" fontSize="2.5" fill="var(--color-text-secondary)">Gymnasium</text>
            {/* Paths */}
            <line x1="45" y1="25" x2="50" y2="22" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeDasharray="1" />
            <line x1="45" y1="47" x2="55" y2="42" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeDasharray="1" />
            {/* Venue pin with pulse */}
            <circle cx={pos.x} cy={pos.y} r="5" fill="#EF4444" opacity="0.2">
              <animate attributeName="r" from="3" to="8" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={pos.x} cy={pos.y} r="3" fill="#EF4444" stroke="white" strokeWidth="1" />
          </svg>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
          Venue: {venue}
        </p>
      </Card>
    </div>
  )
}
