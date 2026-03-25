import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import type { CurriculumEntryWithSubject } from '@/types/database'
import { getNodeStatus, SUBJECT_GRADES, COMPLETED_SUBJECT_IDS } from '../data'

interface CurriculumExportButtonProps {
  curriculum: CurriculumEntryWithSubject[]
  programCode: string
  programName: string
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result?.[1] || !result[2] || !result[3]) return [0, 0, 0]
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

const NAVY = '#0077B6'
const GOLD = '#C8A415'
const WHITE = '#FFFFFF'
const LIGHT_GREY = '#F8F9FC'

export function CurriculumExportButton({ curriculum, programCode, programName }: CurriculumExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    requestAnimationFrame(() => {
      try {
        generateCurriculumPdf(curriculum, programCode, programName)
      } catch {
        // PDF generation failed
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Button variant="secondary" onClick={handleExport} loading={loading} aria-label="Export curriculum checklist as PDF">
      <FileDown className="h-4 w-4" aria-hidden="true" />
      Export Checklist
    </Button>
  )
}

function generateCurriculumPdf(
  curriculum: CurriculumEntryWithSubject[],
  programCode: string,
  programName: string,
): void {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  const navyRgb = hexToRgb(NAVY)
  doc.setFillColor(navyRgb[0], navyRgb[1], navyRgb[2])
  doc.rect(0, 0, pageWidth, 30, 'F')
  const goldRgb = hexToRgb(GOLD)
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2])
  doc.rect(0, 30, pageWidth, 2, 'F')

  const whiteRgb = hexToRgb(WHITE)
  doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2])
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ASU Portal', 15, 15)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Curriculum Checklist — ${programCode}`, 15, 23)

  let y = 40

  doc.setTextColor(navyRgb[0], navyRgb[1], navyRgb[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(programName, 15, y)
  y += 8

  // Group by year/semester
  const grouped = new Map<string, CurriculumEntryWithSubject[]>()
  for (const entry of curriculum) {
    const key = `Year ${entry.year_level} — ${entry.semester}`
    const existing = grouped.get(key) ?? []
    existing.push(entry)
    grouped.set(key, existing)
  }

  for (const [label, entries] of grouped) {
    if (y > 260) { doc.addPage(); y = 20 }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(navyRgb[0], navyRgb[1], navyRgb[2])
    doc.text(label, 15, y)
    y += 2

    const tableData = entries.map((e) => {
      const status = getNodeStatus(e.subject_id, e.prerequisite_subject_ids)
      const grade = SUBJECT_GRADES[e.subject_id]
      const checkmark = COMPLETED_SUBJECT_IDS.has(e.subject_id) ? '\u2713' : ''
      return [
        checkmark,
        e.subject.code,
        e.subject.name,
        e.subject.units.toString(),
        e.subject_type.toUpperCase(),
        grade !== undefined ? grade.toFixed(2) : '--',
        status === 'completed' ? 'Passed' : status === 'in_progress' ? 'In Progress' : status === 'available' ? 'Available' : 'Locked',
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['\u2713', 'Code', 'Subject', 'Units', 'Type', 'Grade', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: hexToRgb(NAVY), textColor: hexToRgb(WHITE), fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: hexToRgb(NAVY) },
      alternateRowStyles: { fillColor: hexToRgb(LIGHT_GREY) },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18 },
        2: { cellWidth: 55 },
        3: { cellWidth: 14, halign: 'center' },
        4: { cellWidth: 16, halign: 'center' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6
  }

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(128, 128, 128)
  doc.text(
    'Generated from AUF Portal. This is an unofficial document — contact the Registrar for official records.',
    pageWidth / 2, 285,
    { align: 'center' },
  )

  doc.save(`ASU Portal_Curriculum_${programCode}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
