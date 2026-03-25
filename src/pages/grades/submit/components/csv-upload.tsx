import { useCallback, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface CsvRow {
  student_number: string
  midterm: string
  final_grade: string
}

interface CsvUploadProps {
  onUpload: (rows: CsvRow[]) => void
  onError: (message: string) => void
}

function parseCsv(text: string): { rows: CsvRow[]; error: string | null } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return { rows: [], error: 'CSV must have a header row and at least one data row.' }
  }

  // Validate header
  const header = lines[0]!.toLowerCase().split(',').map((h) => h.trim())
  const requiredHeaders = ['student_number', 'midterm', 'final_grade']
  const missingHeaders = requiredHeaders.filter((h) => !header.includes(h))

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      error: `Missing required columns: ${missingHeaders.join(', ')}. Expected: student_number, midterm, final_grade`,
    }
  }

  const studentNumberIdx = header.indexOf('student_number')
  const midtermIdx = header.indexOf('midterm')
  const finalGradeIdx = header.indexOf('final_grade')

  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(',').map((c) => c.trim())
    const studentNumber = cols[studentNumberIdx]
    const midterm = cols[midtermIdx]
    const finalGrade = cols[finalGradeIdx]

    if (!studentNumber) {
      return { rows: [], error: `Row ${i + 1}: Missing student_number.` }
    }

    rows.push({
      student_number: studentNumber,
      midterm: midterm ?? '',
      final_grade: finalGrade ?? '',
    })
  }

  return { rows, error: null }
}

export function CsvUpload({ onUpload, onError }: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        onError('Please upload a .csv file.')
        return
      }

      // Limit file size to 1 MB to prevent memory issues
      if (file.size > 1_048_576) {
        onError('File is too large. Maximum size is 1 MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text !== 'string') {
          onError('Failed to read file.')
          return
        }

        const { rows, error } = parseCsv(text)
        if (error) {
          onError(error)
          return
        }

        onUpload(rows)
      }
      reader.onerror = () => {
        onError('Failed to read file.')
      }
      reader.readAsText(file)

      // Reset so the same file can be re-uploaded
      e.target.value = ''
    },
    [onUpload, onError],
  )

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            CSV Bulk Upload
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Format: student_number, midterm, final_grade (with header row)
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload CSV file for grade entry"
      />
      <div className="rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2">
        <p className="text-xs font-mono text-[var(--color-text-secondary)]">
          student_number,midterm,final_grade
          <br />
          2024-00001,1.75,2.0
          <br />
          2024-00002,2.5,2.25
        </p>
      </div>
    </Card>
  )
}
