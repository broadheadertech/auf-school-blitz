import { useState, useEffect } from 'react'
import { Upload, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { BalanceCard } from './components/balance-card'
import { FeeBreakdown } from './components/fee-breakdown'
import { PaymentHistory } from './components/payment-history'
import { UploadProofModal } from './components/upload-proof-modal'
import { DeadlineWidget } from './components/deadline-widget'
import { FinancialAidExport } from './components/financial-aid-export'
import { MOCK_FEES, MOCK_PAYMENTS, formatPeso, getPaymentMethodLabel } from './data'
import { useStudentPayments } from '@/hooks/use-supabase-query'
import { supabase } from '@/lib/supabase'
import type { BadgeVariant } from '@/components/ui/badge'
import type { Fee, Payment } from '@/types/database'

export default function PaymentsPage() {
  const { role, user } = useAuthStore()
  const [uploadOpen, setUploadOpen] = useState(false)

  const { fees: liveFees, payments: livePayments, loading } = useStudentPayments()
  const fees: Fee[] = liveFees.length > 0 ? liveFees : MOCK_FEES
  const payments: Payment[] = livePayments.length > 0 ? livePayments : MOCK_PAYMENTS

  if (role === 'admin') {
    return <AdminPaymentReview />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Payments</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          <div className="h-48 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Payments</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            2nd Sem AY 2025-2026
          </p>
        </div>
        <div className="flex gap-3">
          <FinancialAidExport fees={fees} payments={payments} />
          <Button variant="secondary">
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Statement of Account
          </Button>
          <Button variant="primary" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload Proof
          </Button>
        </div>
      </div>

      <BalanceCard fees={fees} payments={payments} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <FeeBreakdown fees={fees} />
          <PaymentHistory payments={payments} />
        </div>
        <div>
          <DeadlineWidget />
        </div>
      </div>

      <UploadProofModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={async ({ method, referenceNumber }) => {
          if (!user) return
          const { data: student } = await (supabase as any).from('students').select('id').eq('user_id', user.id).maybeSingle()
          if (!student) return
          const settings = await (supabase as any).from('academic_settings').select('key, value').in('key', ['current_semester', 'current_academic_year'])
          const settingsMap: Record<string, string> = {}
          for (const s of settings.data ?? []) settingsMap[s.key] = String(s.value).replace(/"/g, '')

          await (supabase as any).from('payments').insert({
            student_id: student.id,
            amount: 0, // Amount to be verified by admin
            method,
            reference_number: referenceNumber,
            status: 'uploaded',
            semester: settingsMap.current_semester ?? '2nd Sem',
            academic_year: settingsMap.current_academic_year ?? '2025-2026',
          })
          setUploadOpen(false)
        }}
      />
    </div>
  )
}

function AdminPaymentReview() {
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [reviewLoading, setReviewLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from('payments').select('*').in('status', ['uploaded', 'under_review']).order('created_at', { ascending: false })
      if (data) setAllPayments(data)
      setReviewLoading(false)
    })()
  }, [])

  const handleAction = async (paymentId: string, action: 'verified' | 'rejected') => {
    await (supabase as any).from('payments').update({ status: action, reviewed_at: new Date().toISOString() }).eq('id', paymentId)
    setAllPayments((prev) => prev.filter((p) => p.id !== paymentId))
  }

  const pendingPayments = allPayments.length > 0 ? allPayments : MOCK_PAYMENTS.filter((p) => p.status === 'uploaded' || p.status === 'under_review')

  const statusBadge: Record<string, { variant: BadgeVariant; label: string }> = {
    uploaded: { variant: 'info', label: 'Uploaded' },
    under_review: { variant: 'warning', label: 'Under Review' },
  }

  return (
    <div className="space-y-6">
      <h1>Payment Review</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Review and process student payment proofs.
      </p>

      {reviewLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />)}
        </div>
      ) : pendingPayments.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-[var(--color-text-secondary)]">No pending payments to review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingPayments.map((payment) => {
            const badge = statusBadge[payment.status] ?? { variant: 'info' as const, label: payment.status }
            return (
              <Card key={payment.id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatPeso(payment.amount)}
                    </p>
                    <Badge variant={badge.variant} label={badge.label} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {getPaymentMethodLabel(payment.method)} — Ref: {payment.reference_number}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(payment.created_at).toLocaleDateString('en-PH')}
                  </p>
                  {/* OCR Results */}
                  {payment.ocr_extracted_text && (
                    <div className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] px-2 py-1.5">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        OCR: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{payment.ocr_extracted_text}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-[var(--color-text-secondary)]">Confidence:</span>
                        <Badge
                          variant={
                            (payment.ocr_confidence ?? 0) >= 80 ? 'success'
                            : (payment.ocr_confidence ?? 0) >= 50 ? 'warning'
                            : 'error'
                          }
                          label={`${payment.ocr_confidence?.toFixed(0) ?? 0}%`}
                        />
                        {payment.ocr_matched && (
                          <Badge variant="success" label="Auto-matched" />
                        )}
                      </div>
                      {!payment.ocr_matched && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter correct ref #"
                            className="w-36 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-mono focus:border-[var(--color-accent)] focus:outline-none"
                            aria-label="Manual reference number correction"
                          />
                          <Button variant="primary">Re-match</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleAction(payment.id, 'verified')}>Approve</Button>
                  <Button variant="secondary" onClick={() => handleAction(payment.id, 'rejected')}>Reject</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
