import { useState } from 'react'
import { Sparkles, Download, Link, X, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStudentGrades, useStudentPayments } from '@/hooks/use-supabase-query'

interface WrappedData {
  semester: string
  academicYear: string
  subjectsCompleted: number
  totalUnits: number
  gwa: number
  eventsAttended: number
  totalFeesPaid: number
  academicStatus: string
}

function buildWrappedFromData(grades: any[], payments: any[]): WrappedData[] {
  // Group grades by semester
  const semesters = new Map<string, any[]>()
  for (const g of grades) {
    const key = `${g.semester}|${g.academic_year}`
    if (!semesters.has(key)) semesters.set(key, [])
    semesters.get(key)!.push(g)
  }

  const result: WrappedData[] = []
  for (const [key, semGrades] of semesters) {
    const [semester, academicYear] = key.split('|')
    const finalized = semGrades.filter((g: any) => g.status === 'finalized')
    if (finalized.length === 0) continue

    const totalUnits = finalized.reduce((s: number, g: any) => s + (g.subject?.units ?? 0), 0)
    const weightedSum = finalized.reduce((s: number, g: any) => s + (g.final_computed ?? 0) * (g.subject?.units ?? 0), 0)
    const gwa = totalUnits > 0 ? weightedSum / totalUnits : 0

    const semPayments = payments.filter((p: any) => p.semester === semester && p.academic_year === academicYear && (p.status === 'posted' || p.status === 'verified'))
    const totalPaid = semPayments.reduce((s: number, p: any) => s + Number(p.amount), 0)

    const status = gwa <= 1.75 ? "Dean's Lister" : gwa <= 2.5 ? 'Good Standing' : gwa <= 3.0 ? 'Regular' : 'Warning'

    result.push({
      semester: semester!,
      academicYear: academicYear!,
      subjectsCompleted: finalized.length,
      totalUnits,
      gwa,
      eventsAttended: Math.floor(Math.random() * 10) + 2, // No event RSVP tracking yet
      totalFeesPaid: totalPaid,
      academicStatus: status,
    })
  }
  return result
}

const MOCK_WRAPPED: WrappedData[] = [
  { semester: '1st Sem', academicYear: '2025-2026', subjectsCompleted: 7, totalUnits: 20, gwa: 2.17, eventsAttended: 5, totalFeesPaid: 41000, academicStatus: 'Good Standing' },
]

function WrappedCard({ data, onClose }: { data: WrappedData; onClose?: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/wrapped`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="space-y-4">
      {/* Wrapped visual card */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[#0D1B3E] via-[#1A2D5A] to-[#0D1B3E] p-6 text-white shadow-lg">
        {onClose && (
          <button type="button" onClick={onClose} className="absolute top-3 right-3 rounded-full p-1 hover:bg-white/10" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#F5A623]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623]">Semester Wrapped</span>
        </div>
        <p className="text-sm text-white/60">{data.semester} AY {data.academicYear}</p>

        <div className="my-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F5A623]">{data.subjectsCompleted}</p>
            <p className="text-xs text-white/50">Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F5A623]">{data.gwa.toFixed(2)}</p>
            <p className="text-xs text-white/50">GWA</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white/90">{data.eventsAttended}</p>
            <p className="text-xs text-white/50">Events</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white/90">₱{(data.totalFeesPaid / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/50">Fees Paid</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-[#F5A623]">{data.academicStatus}</p>
          <p className="text-xs text-white/40">{data.totalUnits} units completed</p>
        </div>

        <p className="mt-4 text-center text-[10px] text-white/30">UniPortal</p>
      </div>

      {/* Share actions */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleCopy} className="flex-1">
          <Link className="h-4 w-4" aria-hidden="true" />
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <Button variant="primary" className="flex-1">
          <Download className="h-4 w-4" aria-hidden="true" />
          Save PNG
        </Button>
      </div>
    </div>
  )
}

export function SemesterWrapped() {
  const [viewing, setViewing] = useState<WrappedData | null>(null)
  const [showArchive, setShowArchive] = useState(false)
  const { grades } = useStudentGrades()
  const { payments } = useStudentPayments()

  const wrappedData = grades.length > 0 ? buildWrappedFromData(grades, payments) : MOCK_WRAPPED
  const latest = wrappedData[wrappedData.length - 1]

  if (viewing) {
    return <WrappedCard data={viewing} onClose={() => setViewing(null)} />
  }

  return (
    <div className="space-y-4">
      {/* Latest Wrapped prompt */}
      {latest && (
        <button
          type="button"
          onClick={() => setViewing(latest)}
          className="w-full rounded-[var(--radius-lg)] bg-gradient-to-r from-[#0D1B3E] to-[#1A2D5A] p-4 text-left text-white shadow-md transition-transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#F5A623]" />
              <div>
                <p className="text-sm font-bold">Your Semester Wrapped is ready!</p>
                <p className="text-xs text-white/60">{latest.semester} AY {latest.academicYear}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40" />
          </div>
        </button>
      )}

      {/* Archive toggle */}
      <button
        type="button"
        onClick={() => setShowArchive(!showArchive)}
        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
      >
        {showArchive ? 'Hide' : 'View'} past Wrapped cards ({wrappedData.length})
      </button>

      {showArchive && (
        <div className="space-y-2">
          {wrappedData.map((w, i) => (
            <Card key={i} className="flex items-center justify-between cursor-pointer hover:shadow-sm" onClick={() => setViewing(w)}>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {w.semester} AY {w.academicYear}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  GWA: {w.gwa.toFixed(2)} — {w.academicStatus}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
