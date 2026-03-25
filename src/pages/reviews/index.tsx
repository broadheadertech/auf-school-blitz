import { useState, useEffect, useMemo } from 'react'
import { Star, BookOpen, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

interface FinalizedSubject {
  subject_id: string
  subject_code: string
  subject_name: string
  units: number
  final_computed: number | null
}

interface CourseReview {
  id: string
  subject_id: string
  student_id: string
  rating: number
  difficulty: number
  workload: number
  comment: string | null
  anonymous: boolean
  created_at: string
  student_name?: string
}

interface SubjectReviewSummary {
  subject: FinalizedSubject
  avgRating: number
  avgDifficulty: number
  avgWorkload: number
  reviewCount: number
  reviews: CourseReview[]
  userReview: CourseReview | null
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-[var(--color-border)]'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function LabeledRating({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
      <span className="w-16">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-6 text-right font-semibold text-[var(--color-text-primary)]">
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export default function ReviewsPage() {
  const { profile } = useAuthStore()
  const profileAny = profile as Record<string, unknown> | null
  const studentId = profileAny?.id as string | undefined

  const [subjects, setSubjects] = useState<FinalizedSubject[]>([])
  const [allReviews, setAllReviews] = useState<CourseReview[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)

  // Review form state
  const [formRating, setFormRating] = useState(0)
  const [formDifficulty, setFormDifficulty] = useState(0)
  const [formWorkload, setFormWorkload] = useState(0)
  const [formComment, setFormComment] = useState('')
  const [formAnonymous, setFormAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch finalized subjects and reviews
  useEffect(() => {
    if (!studentId) return

    const fetchData = async () => {
      setLoading(true)

      // Fetch finalized grades for the student
      const { data: grades } = await db
        .from('grades')
        .select('subject_id, final_computed, subjects(id, code, name, units)')
        .eq('student_id', studentId)
        .eq('status', 'finalized')

      const subjectList: FinalizedSubject[] = []
      const subjectIds: string[] = []

      for (const g of grades ?? []) {
        const subj = g.subjects
        if (subj) {
          subjectList.push({
            subject_id: subj.id,
            subject_code: subj.code,
            subject_name: subj.name,
            units: subj.units,
            final_computed: g.final_computed,
          })
          subjectIds.push(subj.id)
        }
      }

      setSubjects(subjectList)

      // Fetch all reviews for these subjects
      if (subjectIds.length > 0) {
        const { data: reviews } = await db
          .from('course_reviews')
          .select('*')
          .in('subject_id', subjectIds)
          .order('created_at', { ascending: false })

        setAllReviews(reviews ?? [])
      }

      setLoading(false)
    }

    fetchData()
  }, [studentId])

  // Build summary per subject
  const subjectSummaries: SubjectReviewSummary[] = useMemo(() => {
    return subjects.map((subject) => {
      const reviews = allReviews.filter((r) => r.subject_id === subject.subject_id)
      const userReview = reviews.find((r) => r.student_id === studentId) ?? null

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0
      const avgDifficulty =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.difficulty, 0) / reviews.length
          : 0
      const avgWorkload =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.workload, 0) / reviews.length
          : 0

      return {
        subject,
        avgRating,
        avgDifficulty,
        avgWorkload,
        reviewCount: reviews.length,
        reviews,
        userReview,
      }
    })
  }, [subjects, allReviews, studentId])

  const resetForm = () => {
    setFormRating(0)
    setFormDifficulty(0)
    setFormWorkload(0)
    setFormComment('')
    setFormAnonymous(false)
  }

  const handleSubmitReview = async (subjectId: string) => {
    if (!studentId || formRating === 0 || formDifficulty === 0 || formWorkload === 0) return

    setSubmitting(true)

    const { data, error } = await db.from('course_reviews').insert({
      subject_id: subjectId,
      student_id: studentId,
      rating: formRating,
      difficulty: formDifficulty,
      workload: formWorkload,
      comment: formComment.trim() || null,
      anonymous: formAnonymous,
    }).select().single()

    if (!error && data) {
      setAllReviews((prev) => [data, ...prev])
      resetForm()
    }

    setSubmitting(false)
  }

  const toggleExpand = (subjectId: string) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null)
      resetForm()
    } else {
      setExpandedSubjectId(subjectId)
      resetForm()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Course Reviews</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Course Reviews</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Rate and review subjects you have completed
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card className="py-8 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No finalized subjects available for review yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {subjectSummaries.map(({ subject, avgRating, avgDifficulty, avgWorkload, reviewCount, reviews, userReview }) => (
            <Card key={subject.subject_id} className="space-y-3">
              {/* Subject header */}
              <div
                className="flex cursor-pointer items-start justify-between"
                onClick={() => toggleExpand(subject.subject_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleExpand(subject.subject_id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                      {subject.subject_code}
                    </p>
                    <Badge
                      variant={subject.final_computed && subject.final_computed <= 3.0 ? 'success' : 'error'}
                      label={subject.final_computed ? `Grade: ${subject.final_computed}` : 'N/A'}
                    />
                    {userReview && (
                      <Badge variant="info" label="Reviewed" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {subject.subject_name} ({subject.units} units)
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {avgRating > 0 ? avgRating.toFixed(1) : '--'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
                    {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Expanded section */}
              {expandedSubjectId === subject.subject_id && (
                <div className="space-y-4 border-t border-[var(--color-border)] pt-3">
                  {/* Aggregate stats */}
                  {reviewCount > 0 && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <LabeledRating label="Rating" value={avgRating} />
                      <LabeledRating label="Difficulty" value={avgDifficulty} />
                      <LabeledRating label="Workload" value={avgWorkload} />
                    </div>
                  )}

                  {/* Existing reviews */}
                  {reviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Reviews
                      </p>
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StarRating value={review.rating} readonly size="sm" />
                              <span className="text-[10px] text-[var(--color-text-secondary)]">
                                Diff: {review.difficulty}/5 | Work: {review.workload}/5
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--color-text-secondary)]">
                              {new Date(review.created_at).toLocaleDateString('en-PH', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-1 text-xs text-[var(--color-text-primary)]">
                              {review.comment}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                            {review.anonymous ? 'Anonymous' : review.student_name ?? 'Student'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review form */}
                  {userReview ? (
                    <div className="rounded-[var(--radius-md)] bg-green-50 px-3 py-2 text-xs text-green-700">
                      You already reviewed this subject.
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Write a Review
                      </p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                            Overall Rating *
                          </p>
                          <StarRating value={formRating} onChange={setFormRating} />
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                            Difficulty (1-5) *
                          </p>
                          <StarRating value={formDifficulty} onChange={setFormDifficulty} />
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                            Workload (1-5) *
                          </p>
                          <StarRating value={formWorkload} onChange={setFormWorkload} />
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                          Comment (optional)
                        </p>
                        <textarea
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          rows={3}
                          placeholder="Share your experience with this subject..."
                          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formAnonymous}
                            onChange={(e) => setFormAnonymous(e.target.checked)}
                            className="rounded"
                          />
                          {formAnonymous ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          Post anonymously
                        </label>
                        <Button
                          variant="primary"
                          loading={submitting}
                          disabled={formRating === 0 || formDifficulty === 0 || formWorkload === 0}
                          onClick={() => handleSubmitReview(subject.subject_id)}
                        >
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
