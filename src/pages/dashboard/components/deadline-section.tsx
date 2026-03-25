import { CountdownTimer } from '@/components/countdown-timer'

/** Mock deadlines for MVP — will be replaced with real data from Supabase later */
function getMockDeadlines() {
  const now = new Date()

  return [
    {
      label: 'Payment Deadline',
      description: 'Tuition balance due',
      deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    },
    {
      label: 'Enrollment Closes',
      description: 'Last day to add/drop subjects',
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now (amber)
    },
    {
      label: 'Midterm Exams',
      description: 'Midterm examination period starts',
      deadline: new Date(now.getTime() + 18 * 60 * 60 * 1000), // 18 hours from now (red)
    },
  ]
}

export function DeadlineSection() {
  const deadlines = getMockDeadlines()

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
        Upcoming Deadlines
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0">
        {deadlines.map((deadline) => (
          <CountdownTimer
            key={deadline.label}
            label={deadline.label}
            description={deadline.description}
            deadline={deadline.deadline}
          />
        ))}
      </div>
    </section>
  )
}
