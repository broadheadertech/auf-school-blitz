import { Card } from '@/components/ui/card'
import type { Fee } from '@/types/database'
import { formatPeso } from '../data'

interface FeeBreakdownProps {
  fees: Fee[]
}

export function FeeBreakdown({ fees }: FeeBreakdownProps) {
  const total = fees.reduce((sum, f) => sum + f.amount, 0)

  // Group by category
  const categories = new Map<string, Fee[]>()
  for (const fee of fees) {
    const existing = categories.get(fee.category) ?? []
    existing.push(fee)
    categories.set(fee.category, existing)
  }

  return (
    <Card>
      <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
        Fee Breakdown
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Category</th>
              <th scope="col" className="pb-2 text-left font-semibold text-[var(--color-text-secondary)]">Description</th>
              <th scope="col" className="pb-2 text-right font-semibold text-[var(--color-text-secondary)]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="py-2 text-[var(--color-text-secondary)]">{fee.category}</td>
                <td className="py-2 text-[var(--color-text-primary)]">{fee.description}</td>
                <td className="py-2 text-right font-mono text-[var(--color-text-primary)]">{formatPeso(fee.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--color-border)]">
              <td colSpan={2} className="pt-2 font-display font-bold text-[var(--color-text-primary)]">Total</td>
              <td className="pt-2 text-right font-mono font-bold text-[var(--color-primary)]">{formatPeso(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
