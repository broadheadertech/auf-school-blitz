import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { GradeEntry, SemesterGrades } from '@/utils/calculate-gwa'
import { getGwaStatus } from '@/utils/calculate-gwa'

// Branding colors
const NAVY = '#0D1B3E'
const GOLD = '#F5A623'
const WHITE = '#FFFFFF'
const LIGHT_GREY = '#F8F9FC'
const TEXT_SECONDARY = '#64748B'

interface StudentInfo {
  name: string
  studentNumber: string
  program: string
  yearLevel: number
}

interface GradeReportOptions {
  student: StudentInfo
  semesters: SemesterGrades[]
  selectedSemesterIndex: number
}

function computeGwa(grades: GradeEntry[]): number | null {
  const finalized = grades.filter((g) => g.status === 'finalized' && g.final_computed !== null)
  if (finalized.length === 0) return null
  let totalWeighted = 0
  let totalUnits = 0
  for (const g of finalized) {
    totalWeighted += g.final_computed! * g.units
    totalUnits += g.units
  }
  if (totalUnits === 0) return null
  return Math.round((totalWeighted / totalUnits) * 100) / 100
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result?.[1] || !result[2] || !result[3]) return [0, 0, 0]
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

/**
 * Generate a branded PDF grade report.
 */
export function generateGradeReportPdf({
  student,
  semesters,
  selectedSemesterIndex,
}: GradeReportOptions): void {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 0

  // === Navy header bar ===
  const navyRgb = hexToRgb(NAVY)
  doc.setFillColor(navyRgb[0], navyRgb[1], navyRgb[2])
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Gold accent line under header
  const goldRgb = hexToRgb(GOLD)
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2])
  doc.rect(0, 35, pageWidth, 2, 'F')

  // ASU Portal text
  const whiteRgb = hexToRgb(WHITE)
  doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2])
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('ASU Portal', 15, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Grade Report', 15, 27)

  // Date on right side
  doc.setFontSize(9)
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth - 15,
    27,
    { align: 'right' },
  )

  y = 47

  // === Student information ===
  const textRgb = hexToRgb(NAVY)
  doc.setTextColor(textRgb[0], textRgb[1], textRgb[2])
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Student Information', 15, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const secRgb = hexToRgb(TEXT_SECONDARY)

  const studentFields = [
    { label: 'Name', value: student.name },
    { label: 'Student No.', value: student.studentNumber },
    { label: 'Program', value: student.program },
    { label: 'Year Level', value: `${student.yearLevel}${getOrdinalSuffix(student.yearLevel)} Year` },
  ]

  for (const field of studentFields) {
    doc.setTextColor(secRgb[0], secRgb[1], secRgb[2])
    doc.text(`${field.label}:`, 15, y)
    doc.setTextColor(textRgb[0], textRgb[1], textRgb[2])
    doc.setFont('helvetica', 'bold')
    doc.text(field.value, 55, y)
    doc.setFont('helvetica', 'normal')
    y += 6
  }

  y += 5

  // === Semester grade tables ===
  const selectedSemester = semesters[selectedSemesterIndex]
  const semestersToExport = selectedSemester ? [selectedSemester] : semesters

  for (const semester of semestersToExport) {
    const semesterGwa = computeGwa(semester.grades)

    // Semester heading
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textRgb[0], textRgb[1], textRgb[2])
    doc.text(`${semester.semester} - AY ${semester.academic_year}`, 15, y)
    y += 2

    // Grade table
    const tableData = semester.grades.map((g: GradeEntry) => [
      g.subject_code,
      g.subject_name,
      g.units.toString(),
      g.midterm !== null ? g.midterm.toFixed(2) : '--',
      g.final_grade !== null ? g.final_grade.toFixed(2) : '--',
      g.status === 'finalized'
        ? g.final_computed !== null && g.final_computed <= 3.0
          ? 'Passed'
          : 'Failed'
        : 'In Progress',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Subject', 'Units', 'Midterm', 'Final', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: hexToRgb(NAVY),
        textColor: hexToRgb(WHITE),
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: hexToRgb(NAVY),
      },
      alternateRowStyles: {
        fillColor: hexToRgb(LIGHT_GREY),
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 60 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5

    // Semester GWA
    if (semesterGwa !== null) {
      doc.setFontSize(10)
      doc.setTextColor(secRgb[0], secRgb[1], secRgb[2])
      doc.text('Semester GWA:', 15, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(textRgb[0], textRgb[1], textRgb[2])
      doc.text(`${semesterGwa.toFixed(2)} (${getGwaStatus(semesterGwa)})`, 55, y)
      doc.setFont('helvetica', 'normal')
      y += 10
    } else {
      y += 5
    }

    // Check if we need a new page
    if (y > 260) {
      doc.addPage()
      y = 20
    }
  }

  // === Cumulative GWA summary ===
  const cumulativeGwa = computeGwa(semesters.flatMap((s) => s.grades))

  // Gold accent line separator
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2])
  doc.rect(15, y, pageWidth - 30, 1, 'F')
  y += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(textRgb[0], textRgb[1], textRgb[2])
  doc.text('Cumulative GWA', 15, y)

  if (cumulativeGwa !== null) {
    doc.setFontSize(18)
    doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2])
    doc.text(cumulativeGwa.toFixed(2), pageWidth - 15, y, { align: 'right' })

    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secRgb[0], secRgb[1], secRgb[2])
    doc.text(getGwaStatus(cumulativeGwa), pageWidth - 15, y, { align: 'right' })
  }

  y += 15

  // === Footer ===
  doc.setFontSize(8)
  doc.setTextColor(secRgb[0], secRgb[1], secRgb[2])
  doc.text(
    'This is an unofficial grade report generated from ASU Portal. For official records, contact the Registrar.',
    pageWidth / 2,
    285,
    { align: 'center' },
  )

  // Download
  const fileName = `ASU Portal_Grade_Report_${student.studentNumber}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th'
}
