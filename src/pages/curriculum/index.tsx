/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react'
import { UnitSummary } from './components/unit-summary'
import { CurriculumFlowchart } from './components/curriculum-flowchart'
import { CurriculumExportButton } from './components/curriculum-export-button'
import { ProgramSelector } from './components/program-selector'
import { PROGRAMS as MOCK_PROGRAMS, getCurriculum } from './data'
import { supabase } from '@/lib/supabase'
import type { Program, CurriculumEntryWithSubject } from '@/types/database'

const db = supabase as any

export default function CurriculumPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [curriculum, setCurriculum] = useState<CurriculumEntryWithSubject[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch programs from DB
  useEffect(() => {
    (async () => {
      const { data } = await db.from('programs').select('*').order('code')
      if (data && data.length > 0) {
        setPrograms(data)
        setSelectedProgram(data[0].code)
      } else {
        // Fallback to mock
        setPrograms(MOCK_PROGRAMS)
        setSelectedProgram(MOCK_PROGRAMS[0]!.code)
      }
      setLoading(false)
    })()
  }, [])

  // Fetch curriculum map when program changes
  useEffect(() => {
    if (!selectedProgram) return
    const program = programs.find((p) => p.code === selectedProgram)
    if (!program) return

    ;(async () => {
      const { data } = await db.from('curriculum_map')
        .select('*, subjects(id, code, name, units)')
        .eq('program_id', program.id)
        .order('year_level')
        .order('semester')

      if (data && data.length > 0) {
        // Transform to match CurriculumEntryWithSubject shape
        setCurriculum(data.map((entry: any) => ({
          ...entry,
          subject: entry.subjects ?? { id: entry.subject_id, code: '?', name: '?', units: 0 },
        })))
      } else {
        // Fallback to mock
        setCurriculum(getCurriculum(selectedProgram))
      }
    })()
  }, [selectedProgram, programs])

  const program = useMemo(
    () => programs.find((p) => p.code === selectedProgram) ?? programs[0],
    [selectedProgram, programs],
  )

  if (loading || !program) {
    return (
      <div className="space-y-6">
        <h1>Curriculum</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          <div className="h-48 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Curriculum</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Track your degree progress and prerequisites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurriculumExportButton
            curriculum={curriculum}
            programCode={program.code}
            programName={program.name}
          />
          <ProgramSelector
            programs={programs}
            value={selectedProgram}
            onChange={setSelectedProgram}
          />
        </div>
      </div>

      <UnitSummary curriculum={curriculum} totalProgramUnits={program.total_units} />

      <CurriculumFlowchart curriculum={curriculum} />
    </div>
  )
}
