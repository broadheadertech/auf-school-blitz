import { Badge } from '@/components/ui/badge'
import { GRADE_SCALE } from '@/utils/constants'
import type { GradeStatus } from '@/types/database'

interface GradeBadgeProps {
  status: GradeStatus
  finalComputed: number | null
}

/**
 * Determines the display status for a grade based on its status and computed value.
 * - finalized + passing (<=3.0): Passed (green + checkmark)
 * - finalized + failing (>3.0): Failed (red + X)
 * - submitted: same logic as finalized since grade exists
 * - in_progress: In Progress (amber + clock)
 */
function getGradeDisplay(status: GradeStatus, finalComputed: number | null) {
  if (status === 'in_progress') {
    return { variant: 'warning' as const, label: 'In Progress' }
  }

  // submitted or finalized — check if passing
  if (finalComputed !== null && finalComputed <= GRADE_SCALE.PASSING) {
    return { variant: 'success' as const, label: 'Passed' }
  }

  if (finalComputed !== null && finalComputed > GRADE_SCALE.PASSING) {
    return { variant: 'error' as const, label: 'Failed' }
  }

  // submitted but no computed grade yet — treat as in progress
  return { variant: 'warning' as const, label: 'In Progress' }
}

export function GradeBadge({ status, finalComputed }: GradeBadgeProps) {
  const { variant, label } = getGradeDisplay(status, finalComputed)

  return <Badge variant={variant} label={label} />
}
