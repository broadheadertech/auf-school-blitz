import { useState, useRef } from 'react'
import { Share2, Download, Link, QrCode, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getGwaStatus } from '@/utils/calculate-gwa'

interface ShareGradeCardProps {
  gwa: number | null
  semester: string
  academicYear: string
  program: string
  studentName: string
}

export function ShareGradeCard({ gwa, semester, academicYear, program, studentName }: ShareGradeCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (gwa === null) return null

  const status = getGwaStatus(gwa)
  const verificationUrl = `${window.location.origin}/verify/grade?s=${encodeURIComponent(studentName)}&g=${gwa}&sem=${encodeURIComponent(semester)}&ay=${encodeURIComponent(academicYear)}&p=${encodeURIComponent(program)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share Grade Card
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Share grade card">
          <div className="w-full max-w-sm">
            {/* Grade Card Preview */}
            <div
              ref={cardRef}
              className="mb-4 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[#0D1B3E] to-[#1A2D5A] p-6 text-white shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">ASU Portal</span>
                <QrCode className="h-8 w-8 text-[#F5A623]" />
              </div>
              <p className="text-sm text-white/70">{studentName}</p>
              <p className="text-xs text-white/50">{program}</p>
              <div className="my-4 text-center">
                <p className="text-4xl font-bold text-[#F5A623]">{gwa.toFixed(2)}</p>
                <p className="mt-1 text-sm font-semibold text-white/80">{status}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{semester} AY {academicYear}</span>
                <span>Verified</span>
              </div>
            </div>

            {/* Actions */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">Share</h3>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-[var(--color-border)] rounded-[var(--radius-md)]" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCopyLink} className="flex-1">
                  <Link className="h-4 w-4" aria-hidden="true" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button variant="primary" className="flex-1">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Save Image
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-center text-[var(--color-text-secondary)]">
                QR code links to a verification page confirming this grade data
              </p>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
