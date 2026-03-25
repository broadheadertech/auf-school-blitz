import { useState, useEffect } from 'react'
import { HelpCircle, X, Send, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

type TipContext = 'dashboard' | 'grades' | 'enrollment' | 'events' | 'payments' | 'curriculum'

interface PeerTip {
  id: string
  content: string
  authorName: string
  authorYear: number
  authorProgram: string
  pageContext: TipContext
  createdAt: string
}

const MOCK_TIPS: PeerTip[] = [
  { id: 't01', content: 'Pro tip: Register for hackathons early — slots fill up fast!', authorName: 'Kuya Mike', authorYear: 4, authorProgram: 'BSCS', pageContext: 'events', createdAt: '2026-03-10T08:00:00Z' },
  { id: 't02', content: 'Check your GWA trend chart regularly — it helps you see patterns in your study habits.', authorName: 'Ate Jen', authorYear: 3, authorProgram: 'BSCS', pageContext: 'grades', createdAt: '2026-03-08T10:00:00Z' },
  { id: 't03', content: 'Enroll in your MWF subjects first para hindi ma-conflict ang sched mo.', authorName: 'Kuya Paolo', authorYear: 4, authorProgram: 'BSIT', pageContext: 'enrollment', createdAt: '2026-03-05T09:00:00Z' },
  { id: 't04', content: 'Save your enrollment confirmation PDF — you\'ll need it for scholarship applications!', authorName: 'Ate Maria', authorYear: 3, authorProgram: 'BSCS', pageContext: 'enrollment', createdAt: '2026-03-01T14:00:00Z' },
  { id: 't05', content: 'Upload your payment proof as soon as you pay — don\'t wait for the deadline!', authorName: 'Kuya Ray', authorYear: 4, authorProgram: 'BSIT', pageContext: 'payments', createdAt: '2026-02-28T11:00:00Z' },
  { id: 't06', content: 'The Degree Progress Tracker shows which subjects you can take next — check it before enrollment!', authorName: 'Ate Lisa', authorYear: 3, authorProgram: 'BSCS', pageContext: 'curriculum', createdAt: '2026-02-25T08:00:00Z' },
  { id: 't07', content: 'Customize your dashboard — put Grades and Payments at the top for quick access!', authorName: 'Kuya Dan', authorYear: 4, authorProgram: 'BSCS', pageContext: 'dashboard', createdAt: '2026-03-15T07:00:00Z' },
]

interface PeerTipsButtonProps {
  pageContext: TipContext
}

export function PeerTipsButton({ pageContext }: PeerTipsButtonProps) {
  const [open, setOpen] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitText, setSubmitText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { role, profile } = useAuthStore()

  const [liveTips, setLiveTips] = useState<PeerTip[]>([])

  useEffect(() => {
    ;(async () => {
      const { data } = await (supabase as any).from('peer_tips').select('*, students(first_name, last_name, year_level, program)').eq('page_context', pageContext).eq('status', 'approved').order('created_at', { ascending: false }).limit(5)
      if (data) {
        setLiveTips(data.map((t: any) => ({
          id: t.id,
          content: t.content,
          authorName: t.students ? `${t.students.first_name} ${t.students.last_name}` : 'Anonymous',
          authorYear: t.students?.year_level ?? 0,
          authorProgram: t.students?.program ?? '',
          pageContext: t.page_context,
          createdAt: t.created_at,
        })))
      }
    })()
  }, [pageContext])

  const contextTips = liveTips.length > 0
    ? liveTips.slice(0, 3)
    : MOCK_TIPS.filter((t) => t.pageContext === pageContext).slice(0, 3)

  // Check if user is 3rd year+ student
  const profileAny = profile as Record<string, unknown> | null
  const yearLevel = profileAny?.year_level as number | undefined
  const canSubmit = role === 'student' && (yearLevel ?? 0) >= 3

  const handleSubmit = async () => {
    if (!submitText.trim()) return
    const profileAnyInner = profile as Record<string, unknown> | null
    const studentId = profileAnyInner?.id as string | undefined
    if (!studentId) return

    await (supabase as any).from('peer_tips').insert({
      author_id: studentId,
      content: submitText.trim(),
      page_context: pageContext,
      status: 'pending',
    })

    setSubmitted(true)
    setSubmitText('')
    setTimeout(() => { setSubmitted(false); setShowSubmit(false) }, 2000)
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-transform hover:scale-110 xl:bottom-6"
        aria-label="Peer tips"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Tips panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[min(340px,calc(100vw-2rem))] xl:bottom-6" role="dialog" aria-label="Peer tips">
          <Card className="shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                  Kuya/Ate Tips
                </h3>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  Advice from upperclassmen
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-[var(--color-border)] rounded-[var(--radius-md)]" aria-label="Close tips">
                <X className="h-4 w-4" />
              </button>
            </div>

            {contextTips.length === 0 ? (
              <p className="text-center text-xs text-[var(--color-text-secondary)] py-4">
                No tips for this page yet. Be the first!
              </p>
            ) : (
              <div className="space-y-2">
                {contextTips.map((tip) => (
                  <div key={tip.id} className="rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3">
                    <p className="text-sm text-[var(--color-text-primary)]">{tip.content}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)]">
                      <User className="h-3 w-3" />
                      <span>{tip.authorName}</span>
                      <Badge variant="info" label={`${tip.authorProgram} ${tip.authorYear}Y`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canSubmit && !showSubmit && (
              <button
                type="button"
                onClick={() => setShowSubmit(true)}
                className="mt-3 w-full text-center text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Submit a Tip
              </button>
            )}

            {showSubmit && (
              <div className="mt-3 space-y-2">
                {submitted ? (
                  <p className="text-center text-xs text-green-600">Tip submitted for review!</p>
                ) : (
                  <>
                    <textarea
                      value={submitText}
                      onChange={(e) => setSubmitText(e.target.value.slice(0, 280))}
                      placeholder="Share a tip for this page (max 280 chars)..."
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                      rows={2}
                      maxLength={280}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{submitText.length}/280</span>
                      <Button variant="primary" onClick={handleSubmit} disabled={!submitText.trim()}>
                        <Send className="h-3.5 w-3.5" />
                        Submit
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
