import { Card } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { Payment } from '@/types/database'
import { formatPeso, getPaymentMethodLabel, PAYMENT_STATUS_STEPS } from '../data'

interface PaymentHistoryProps {
  payments: Payment[]
}

function StatusStepper({ status }: { status: Payment['status'] }) {
  const currentIdx = PAYMENT_STATUS_STEPS.indexOf(status as (typeof PAYMENT_STATUS_STEPS)[number])
  const isRejected = status === 'rejected'

  return (
    <div className="flex items-center gap-1">
      {PAYMENT_STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={`h-2 w-2 rounded-full ${
              isRejected
                ? 'bg-[var(--color-error)]'
                : idx <= currentIdx
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-border)]'
            }`}
          />
          {idx < PAYMENT_STATUS_STEPS.length - 1 && (
            <div
              className={`h-0.5 w-4 ${
                isRejected
                  ? 'bg-[var(--color-error)]'
                  : idx < currentIdx
                    ? 'bg-[var(--color-success)]'
                    : 'bg-[var(--color-border)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const statusBadge: Record<Payment['status'], { variant: BadgeVariant; label: string }> = {
  uploaded: { variant: 'info', label: 'Uploaded' },
  under_review: { variant: 'warning', label: 'Under Review' },
  verified: { variant: 'success', label: 'Verified' },
  posted: { variant: 'success', label: 'Posted' },
  rejected: { variant: 'error', label: 'Rejected' },
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">No payment records yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
        Payment History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Date</th>
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Reference</th>
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Method</th>
              <th scope="col" className="pb-2 text-right font-semibold text-[var(--color-text-secondary)]">Amount</th>
              <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Status</th>
              <th scope="col" className="pb-2 text-center font-semibold text-[var(--color-text-secondary)]">Progress</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const badge = statusBadge[payment.status]
              return (
                <tr key={payment.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-2 text-[var(--color-text-secondary)]">
                    {new Date(payment.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-2 font-mono text-xs text-[var(--color-text-primary)]">
                    {payment.reference_number ?? '--'}
                  </td>
                  <td className="py-2 text-[var(--color-text-primary)]">
                    {getPaymentMethodLabel(payment.method)}
                  </td>
                  <td className="py-2 text-right font-mono text-[var(--color-text-primary)]">
                    {formatPeso(payment.amount)}
                  </td>
                  <td className="py-2 text-center">
                    <Badge variant={badge.variant} label={badge.label} />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-center">
                      <StatusStepper status={payment.status} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
