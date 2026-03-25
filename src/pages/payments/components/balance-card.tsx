import { Wallet, TrendingDown, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Fee, Payment } from '@/types/database'
import { formatPeso } from '../data'

interface BalanceCardProps {
  fees: Fee[]
  payments: Payment[]
}

export function BalanceCard({ fees, payments }: BalanceCardProps) {
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
  const paidPayments = payments.filter((p) => p.status === 'posted' || p.status === 'verified')
  const amountPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalFees - amountPaid

  const stats = [
    { label: 'Total Fees', value: totalFees, icon: Wallet, color: 'var(--color-primary)' },
    { label: 'Amount Paid', value: amountPaid, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'Outstanding', value: balance, icon: TrendingDown, color: balance > 0 ? 'var(--color-error)' : 'var(--color-success)' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
          >
            <stat.icon className="h-5 w-5" style={{ color: stat.color }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
            <p className="font-display text-xl font-bold text-[var(--color-text-primary)]">
              {formatPeso(stat.value)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
