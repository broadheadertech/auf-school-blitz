import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AVAILABLE_SECTIONS } from '../data'

interface HeatmapCell {
  sectionId: string
  sectionCode: string
  subjectCode: string
  enrolled: number
  capacity: number
  fillPercent: number
}

export function EnrollmentHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null)

  // Build heatmap data: subjects as rows, sections as columns
  const subjectMap = new Map<string, HeatmapCell[]>()
  for (const section of AVAILABLE_SECTIONS) {
    const subjectCode = section.subject.code
    const cells = subjectMap.get(subjectCode) ?? []
    cells.push({
      sectionId: section.id,
      sectionCode: section.section_code,
      subjectCode,
      enrolled: section.enrolled_count,
      capacity: section.capacity,
      fillPercent: Math.round((section.enrolled_count / section.capacity) * 100),
    })
    subjectMap.set(subjectCode, cells)
  }

  const subjects = Array.from(subjectMap.keys())
  const maxSections = Math.max(...Array.from(subjectMap.values()).map((c) => c.length))

  function getCellColor(fillPercent: number): string {
    if (fillPercent > 90) return 'bg-red-100 border-red-300 text-red-700'
    if (fillPercent > 70) return 'bg-amber-100 border-amber-300 text-amber-700'
    return 'bg-green-100 border-green-300 text-green-700'
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
        Enrollment Heatmap
      </h2>
      <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
        Subjects as rows, sections as columns. Color: green (&lt;70%), amber (70-90%), red (&gt;90%)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Subject</th>
              {Array.from({ length: maxSections }, (_, i) => (
                <th key={i} scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">
                  Section {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const cells = subjectMap.get(subject)!
              return (
                <tr key={subject}>
                  <td className="py-1.5 pr-3 font-semibold text-[var(--color-text-primary)]">{subject}</td>
                  {Array.from({ length: maxSections }, (_, i) => {
                    const cell = cells[i]
                    if (!cell) return <td key={i} />
                    return (
                      <td key={i} className="py-1.5 px-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          className={`w-full rounded-[var(--radius-md)] border px-2 py-1.5 text-center text-xs font-bold transition-shadow hover:shadow-sm ${getCellColor(cell.fillPercent)}`}
                          aria-label={`${cell.sectionCode}: ${cell.enrolled}/${cell.capacity} (${cell.fillPercent}%)`}
                        >
                          {cell.fillPercent}%
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="font-semibold">Legend:</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-200" /> &lt;70%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200" /> 70-90%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-200" /> &gt;90%</span>
      </div>

      {/* Detail popup */}
      {selectedCell && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[var(--color-text-primary)]">{selectedCell.sectionCode}</p>
            <Badge
              variant={selectedCell.fillPercent > 90 ? 'error' : selectedCell.fillPercent > 70 ? 'warning' : 'success'}
              label={`${selectedCell.fillPercent}%`}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {selectedCell.enrolled} / {selectedCell.capacity} enrolled
          </p>
          <button
            type="button"
            onClick={() => setSelectedCell(null)}
            className="mt-2 text-xs text-[var(--color-primary)] hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </Card>
  )
}
