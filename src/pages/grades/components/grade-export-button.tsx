import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateGradeReportPdf } from '@/lib/pdf'
import type { SemesterGrades } from '@/utils/calculate-gwa'

interface GradeExportButtonProps {
  semesters: SemesterGrades[]
  selectedSemesterIndex: number
}

export function GradeExportButton({
  semesters,
  selectedSemesterIndex,
}: GradeExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    // Use requestAnimationFrame to allow the loading state to render
    requestAnimationFrame(() => {
      try {
        generateGradeReportPdf({
          student: {
            name: 'Maria Santos',
            studentNumber: '2023-00142',
            program: 'Bachelor of Science in Computer Science',
            yearLevel: 3,
          },
          semesters,
          selectedSemesterIndex,
        })
      } catch {
        // PDF generation failed — silently recover
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      loading={loading}
      aria-label="Export grade report as PDF"
    >
      <FileDown className="h-4 w-4" aria-hidden="true" />
      Export PDF
    </Button>
  )
}
