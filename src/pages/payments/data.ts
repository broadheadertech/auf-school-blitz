import type { Fee, Payment } from '@/types/database'

export const MOCK_FEES: Fee[] = [
  { id: 'f01', student_id: 's01', category: 'Tuition', description: 'Tuition Fee (20 units x ₱1,500)', amount: 30000, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
  { id: 'f02', student_id: 's01', category: 'Miscellaneous', description: 'Miscellaneous Fees', amount: 5000, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
  { id: 'f03', student_id: 's01', category: 'Laboratory', description: 'Computer Laboratory Fee', amount: 3000, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
  { id: 'f04', student_id: 's01', category: 'ID', description: 'Student ID Card', amount: 500, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
  { id: 'f05', student_id: 's01', category: 'Others', description: 'Library Fee', amount: 1000, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
  { id: 'f06', student_id: 's01', category: 'Others', description: 'Development Fee', amount: 1500, semester: '2nd Sem', academic_year: '2025-2026', created_at: '2026-01-05T00:00:00Z' },
]

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p01', student_id: 's01', amount: 20000, method: 'gcash', reference_number: 'GC-2026-001234', proof_url: null, status: 'posted', reject_reason: null, reviewed_by: 'a01', reviewed_at: '2026-01-15T10:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'GC-2026-001234', ocr_confidence: 95.5, ocr_matched: true, created_at: '2026-01-12T08:30:00Z' },
  { id: 'p02', student_id: 's01', amount: 10000, method: 'bank_transfer', reference_number: 'BDO-2026-5678', proof_url: null, status: 'verified', reject_reason: null, reviewed_by: 'a01', reviewed_at: '2026-02-10T14:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'BDO-2026-5678', ocr_confidence: 88.2, ocr_matched: true, created_at: '2026-02-08T09:15:00Z' },
  { id: 'p03', student_id: 's01', amount: 5000, method: 'maya', reference_number: 'MY-2026-9012', proof_url: null, status: 'under_review', reject_reason: null, reviewed_by: null, reviewed_at: null, semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'MY-2O26-9O12', ocr_confidence: 62.0, ocr_matched: false, created_at: '2026-03-01T11:00:00Z' },
]

export const PAYMENT_DEADLINE = '2026-03-31T23:59:59Z'

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getPaymentMethodLabel(method: Payment['method']): string {
  const labels: Record<Payment['method'], string> = {
    gcash: 'GCash',
    maya: 'Maya',
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    cashier: 'Cashier',
  }
  return labels[method]
}

export const PAYMENT_STATUS_STEPS = ['uploaded', 'under_review', 'verified', 'posted'] as const
