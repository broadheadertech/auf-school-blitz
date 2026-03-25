import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import type { Fee, Payment } from '@/types/database'
import { formatPeso, getPaymentMethodLabel } from '../data'

interface FinancialAidExportProps {
  fees: Fee[]
  payments: Payment[]
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result?.[1] || !result[2] || !result[3]) return [0, 0, 0]
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

const NAVY = '#0D1B3E'
const GOLD = '#F5A623'
const WHITE = '#FFFFFF'

export function FinancialAidExport({ fees, payments }: FinancialAidExportProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    requestAnimationFrame(() => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4')
        const pageWidth = doc.internal.pageSize.getWidth()
        const navyRgb = hexToRgb(NAVY)
        const goldRgb = hexToRgb(GOLD)
        const whiteRgb = hexToRgb(WHITE)

        // Header
        doc.setFillColor(navyRgb[0], navyRgb[1], navyRgb[2])
        doc.rect(0, 0, pageWidth, 30, 'F')
        doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2])
        doc.rect(0, 30, pageWidth, 2, 'F')
        doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2])
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('ASU Portal', 15, 15)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Financial Aid Evidence', 15, 23)

        let y = 40

        // Student info
        doc.setTextColor(navyRgb[0], navyRgb[1], navyRgb[2])
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Student Information', 15, y)
        y += 7
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const info = [
          { label: 'Name', value: 'Maria Santos' },
          { label: 'Student No.', value: '2023-00142' },
          { label: 'Program', value: 'BSCS' },
          { label: 'Year Level', value: '1st Year' },
          { label: 'Semester', value: '2nd Sem AY 2025-2026' },
        ]
        for (const item of info) {
          doc.text(`${item.label}: ${item.value}`, 15, y)
          y += 5
        }
        y += 5

        // Fee breakdown
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Fee Breakdown', 15, y)
        y += 2
        const feeData = fees.map((f) => [f.category, f.description, formatPeso(f.amount)])
        const totalFees = fees.reduce((s, f) => s + f.amount, 0)
        autoTable(doc, {
          startY: y,
          head: [['Category', 'Description', 'Amount']],
          body: [...feeData, ['', 'Total', formatPeso(totalFees)]],
          headStyles: { fillColor: hexToRgb(NAVY), textColor: hexToRgb(WHITE), fontSize: 8 },
          bodyStyles: { fontSize: 8, textColor: hexToRgb(NAVY) },
          margin: { left: 15, right: 15 },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 8

        // Payment history
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Payment History', 15, y)
        y += 2
        const paidPayments = payments.filter((p) => p.status === 'posted' || p.status === 'verified')
        const payData = paidPayments.map((p) => [
          new Date(p.created_at).toLocaleDateString('en-PH'),
          getPaymentMethodLabel(p.method),
          p.reference_number ?? '--',
          formatPeso(p.amount),
        ])
        const totalPaid = paidPayments.reduce((s, p) => s + p.amount, 0)
        autoTable(doc, {
          startY: y,
          head: [['Date', 'Method', 'Reference', 'Amount']],
          body: [...payData, ['', '', 'Total Paid', formatPeso(totalPaid)]],
          headStyles: { fillColor: hexToRgb(NAVY), textColor: hexToRgb(WHITE), fontSize: 8 },
          bodyStyles: { fontSize: 8, textColor: hexToRgb(NAVY) },
          margin: { left: 15, right: 15 },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 8

        // Balance summary
        const balance = totalFees - totalPaid
        doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2])
        doc.rect(15, y, pageWidth - 30, 1, 'F')
        y += 6
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Outstanding Balance', 15, y)
        doc.setFontSize(16)
        doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2])
        doc.text(formatPeso(balance), pageWidth - 15, y, { align: 'right' })

        // Footer
        doc.setFontSize(7)
        doc.setTextColor(128, 128, 128)
        doc.text(
          'Generated from ASU Portal for financial aid purposes. Contact the Registrar for official certification.',
          pageWidth / 2, 285, { align: 'center' },
        )

        doc.save(`ASU Portal_Financial_Aid_Evidence_${new Date().toISOString().slice(0, 10)}.pdf`)
      } catch { /* */ } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Button variant="secondary" onClick={handleExport} loading={loading} aria-label="Export financial aid evidence">
      <FileDown className="h-4 w-4" aria-hidden="true" />
      Financial Aid Evidence
    </Button>
  )
}
