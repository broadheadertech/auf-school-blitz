import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PaymentMethod } from '@/types/database'

interface UploadProofModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { method: PaymentMethod; referenceNumber: string; file: File | null }) => void
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'gcash', label: 'GCash' },
  { value: 'maya', label: 'Maya' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
]

export function UploadProofModal({ open, onClose, onSubmit }: UploadProofModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('gcash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const [processing, setProcessing] = useState(false)
  const [ocrStatus, setOcrStatus] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setOcrStatus('Uploading proof...')

    // Simulate OCR processing delay for MVP
    setTimeout(() => {
      setOcrStatus('Processing OCR...')
      setTimeout(() => {
        onSubmit({ method, referenceNumber, file })
        setOcrStatus('Reference number extracted!')
        setTimeout(() => {
          setProcessing(false)
          setOcrStatus(null)
          setMethod('gcash')
          setReferenceNumber('')
          setFile(null)
          onClose()
        }, 1000)
      }, 1500)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Upload payment proof">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Upload Payment Proof
          </h2>
          <button type="button" onClick={onClose} className="rounded-[var(--radius-md)] p-1 hover:bg-[var(--color-border)]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. GC-2026-001234"
            required
          />

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Proof Image</label>
            <div
              className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              {file ? file.name : 'Click to upload screenshot'}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
              aria-label="Upload proof image"
            />
          </div>

          {ocrStatus && (
            <div className="rounded-[var(--radius-md)] bg-blue-50 border border-blue-200 px-3 py-2 text-center">
              <p className="text-sm text-blue-700">{ocrStatus}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1" disabled={processing}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={!referenceNumber.trim() || processing}>
              {processing ? 'Processing...' : 'Submit Proof'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
