import { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, User, Plus, Trash2, CalendarCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

interface FacultyMember {
  id: string
  user_id: string
  first_name: string
  last_name: string
  department: string | null
}

interface ConsultationSlot {
  id: string
  faculty_id: string
  day_of_week: string
  start_time: string
  end_time: string
  max_bookings: number
  created_at: string
}

interface ConsultationBooking {
  id: string
  slot_id: string
  student_id: string
  student_name?: string
  date: string
  status: string
  created_at: string
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h! >= 12 ? 'PM' : 'AM'
  const hour12 = h! % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

function getNextDateForDay(dayName: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date()
  const todayIdx = today.getDay()
  const targetIdx = days.indexOf(dayName)
  let diff = targetIdx - todayIdx
  if (diff <= 0) diff += 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toISOString().split('T')[0]!
}

export default function ConsultationsPage() {
  const { role } = useAuthStore()

  if (role === 'faculty') {
    return <FacultyConsultationView />
  }

  return <StudentConsultationView />
}

// ── Student View ──────────────────────────────────────────────────────────────

function StudentConsultationView() {
  const { profile } = useAuthStore()
  const profileAny = profile as Record<string, unknown> | null
  const studentId = profileAny?.id as string | undefined

  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [slots, setSlots] = useState<ConsultationSlot[]>([])
  const [myBookings, setMyBookings] = useState<ConsultationBooking[]>([])
  const [allBookings, setAllBookings] = useState<ConsultationBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return

    const fetchData = async () => {
      setLoading(true)

      // Fetch faculty
      const { data: facultyData } = await db
        .from('faculty')
        .select('id, user_id, first_name, last_name, department')

      setFaculty(facultyData ?? [])

      // Fetch all consultation slots
      const { data: slotData } = await db
        .from('consultation_slots')
        .select('*')
        .order('day_of_week', { ascending: true })

      setSlots(slotData ?? [])

      // Fetch my bookings
      const { data: myBookingData } = await db
        .from('consultation_bookings')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })

      setMyBookings(myBookingData ?? [])

      // Fetch all bookings to know availability
      const { data: allBookingData } = await db
        .from('consultation_bookings')
        .select('slot_id, date, status')
        .neq('status', 'cancelled')

      setAllBookings(allBookingData ?? [])

      setLoading(false)
    }

    fetchData()
  }, [studentId])

  const facultyMap = useMemo(() => {
    const map = new Map<string, FacultyMember>()
    for (const f of faculty) map.set(f.id, f)
    return map
  }, [faculty])

  // Group slots by faculty
  const slotsByFaculty = useMemo(() => {
    const map = new Map<string, ConsultationSlot[]>()
    for (const slot of slots) {
      const existing = map.get(slot.faculty_id) ?? []
      existing.push(slot)
      map.set(slot.faculty_id, existing)
    }
    return map
  }, [slots])

  const getBookingCountForSlot = (slotId: string, date: string): number => {
    return allBookings.filter(
      (b) => b.slot_id === slotId && b.date === date && b.status !== 'cancelled',
    ).length
  }

  const handleBook = async (slot: ConsultationSlot) => {
    if (!studentId) return

    const date = getNextDateForDay(slot.day_of_week)
    setBookingSlotId(slot.id)

    const { data, error } = await db
      .from('consultation_bookings')
      .insert({
        slot_id: slot.id,
        student_id: studentId,
        date,
        status: 'confirmed',
      })
      .select()
      .single()

    if (!error && data) {
      setMyBookings((prev) => [data, ...prev])
      setAllBookings((prev) => [...prev, { slot_id: slot.id, date, status: 'confirmed' } as ConsultationBooking])
    }

    setBookingSlotId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Consultations</h1>
        <div className="grid gap-4 sm:grid-cols-2">
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
        <h1>Consultations</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Book faculty office hours for academic consultations
        </p>
      </div>

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            My Bookings
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myBookings.map((booking) => {
              const slot = slots.find((s) => s.id === booking.slot_id)
              const fac = slot ? facultyMap.get(slot.faculty_id) : null

              return (
                <Card key={booking.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                        {fac ? `${fac.first_name} ${fac.last_name}` : 'Faculty'}
                      </p>
                      {fac?.department && (
                        <p className="text-[10px] text-[var(--color-text-secondary)]">
                          {fac.department}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'}
                      label={booking.status}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-PH', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {slot && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available slots by faculty */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
          Available Consultation Slots
        </h2>

        {faculty.length === 0 ? (
          <Card className="py-8 text-center">
            <User className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              No faculty consultation slots available.
            </p>
          </Card>
        ) : (
          Array.from(slotsByFaculty.entries()).map(([facultyId, facultySlots]) => {
            const fac = facultyMap.get(facultyId)
            if (!fac) return null

            return (
              <Card key={facultyId} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-sm font-bold text-[var(--color-primary)]">
                    {fac.first_name.charAt(0)}
                    {fac.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                      {fac.first_name} {fac.last_name}
                    </p>
                    {fac.department && (
                      <p className="text-[10px] text-[var(--color-text-secondary)]">
                        {fac.department}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {facultySlots.map((slot) => {
                    const nextDate = getNextDateForDay(slot.day_of_week)
                    const currentBookings = getBookingCountForSlot(slot.id, nextDate)
                    const isFull = currentBookings >= slot.max_bookings
                    const alreadyBooked = myBookings.some(
                      (b) => b.slot_id === slot.id && b.date === nextDate && b.status !== 'cancelled',
                    )

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xs">
                            <p className="font-semibold text-[var(--color-text-primary)]">
                              {slot.day_of_week}
                            </p>
                            <p className="text-[var(--color-text-secondary)]">
                              {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                            </p>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-secondary)]">
                            {currentBookings}/{slot.max_bookings} booked
                          </span>
                        </div>
                        <div>
                          {alreadyBooked ? (
                            <Badge variant="success" label="Booked" />
                          ) : isFull ? (
                            <Badge variant="error" label="Full" />
                          ) : (
                            <Button
                              variant="primary"
                              loading={bookingSlotId === slot.id}
                              onClick={() => handleBook(slot)}
                            >
                              Book
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Faculty View ──────────────────────────────────────────────────────────────

function FacultyConsultationView() {
  const { profile } = useAuthStore()
  const facultyId = (profile as Record<string, unknown> | null)?.id as string | undefined

  const [slots, setSlots] = useState<ConsultationSlot[]>([])
  const [bookings, setBookings] = useState<ConsultationBooking[]>([])
  const [loading, setLoading] = useState(true)

  // Add slot form
  const [addDay, setAddDay] = useState(DAYS_OF_WEEK[0]!)
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('10:00')
  const [addMax, setAddMax] = useState(5)
  const [addingSlot, setAddingSlot] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!facultyId) return

    const fetchData = async () => {
      setLoading(true)

      const { data: slotData } = await db
        .from('consultation_slots')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('day_of_week', { ascending: true })

      setSlots(slotData ?? [])

      // Fetch bookings for my slots
      const slotIds = (slotData ?? []).map((s: ConsultationSlot) => s.id)
      if (slotIds.length > 0) {
        const { data: bookingData } = await db
          .from('consultation_bookings')
          .select('*')
          .in('slot_id', slotIds)
          .order('date', { ascending: true })

        setBookings(bookingData ?? [])
      }

      setLoading(false)
    }

    fetchData()
  }, [facultyId])

  // Today's bookings
  const today = new Date().toISOString().split('T')[0]
  const todaysBookings = useMemo(
    () => bookings.filter((b) => b.date === today && b.status !== 'cancelled'),
    [bookings, today],
  )

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.date >= today! && b.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bookings, today],
  )

  const handleAddSlot = async () => {
    if (!facultyId) return

    setAddingSlot(true)
    const { data, error } = await db
      .from('consultation_slots')
      .insert({
        faculty_id: facultyId,
        day_of_week: addDay,
        start_time: addStart,
        end_time: addEnd,
        max_bookings: addMax,
      })
      .select()
      .single()

    if (!error && data) {
      setSlots((prev) => [...prev, data])
      setShowAddForm(false)
    }

    setAddingSlot(false)
  }

  const handleRemoveSlot = async (slotId: string) => {
    await db.from('consultation_slots').delete().eq('id', slotId)
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
    setBookings((prev) => prev.filter((b) => b.slot_id !== slotId))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Consultations</h1>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Consultations</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage your office hours and view bookings
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Slot
        </Button>
      </div>

      {/* Add slot form */}
      {showAddForm && (
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Add Office Hours Slot
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[var(--color-text-secondary)]">
                Day
              </label>
              <select
                value={addDay}
                onChange={(e) => setAddDay(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[var(--color-text-secondary)]">
                Start Time
              </label>
              <input
                type="time"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[var(--color-text-secondary)]">
                End Time
              </label>
              <input
                type="time"
                value={addEnd}
                onChange={(e) => setAddEnd(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[var(--color-text-secondary)]">
                Max Bookings
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={addMax}
                onChange={(e) => setAddMax(Number(e.target.value))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={addingSlot} onClick={handleAddSlot}>
              Save Slot
            </Button>
          </div>
        </Card>
      )}

      {/* Today's bookings */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
          <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            Today's Bookings
          </p>
          <Badge
            variant={todaysBookings.length > 0 ? 'info' : 'neutral'}
            label={`${todaysBookings.length}`}
          />
        </div>
        {todaysBookings.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)]">
            No consultations booked for today.
          </p>
        ) : (
          <div className="space-y-2">
            {todaysBookings.map((booking) => {
              const slot = slots.find((s) => s.id === booking.slot_id)
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2"
                >
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      Student: {booking.student_name ?? booking.student_id.slice(0, 8) + '...'}
                    </p>
                    {slot && (
                      <p className="text-[var(--color-text-secondary)]">
                        {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                      </p>
                    )}
                  </div>
                  <Badge variant="success" label={booking.status} />
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* My slots */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
          My Office Hours
        </h2>

        {slots.length === 0 ? (
          <Card className="py-8 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              No office hours configured. Click "Add Slot" to get started.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => {
              const slotBookings = bookings.filter(
                (b) => b.slot_id === slot.id && b.status !== 'cancelled',
              )

              return (
                <Card key={slot.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                        {slot.day_of_week}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                        Max: {slot.max_bookings} students
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="text-[var(--color-error)] hover:bg-red-50 rounded-[var(--radius-md)] p-1 transition-colors"
                      aria-label={`Remove ${slot.day_of_week} slot`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Upcoming bookings for this slot */}
                  {slotBookings.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-2">
                      <p className="text-[10px] font-semibold text-[var(--color-text-secondary)]">
                        Upcoming ({slotBookings.length})
                      </p>
                      {slotBookings.slice(0, 3).map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--color-text-primary)]">
                            {b.student_name ?? b.student_id.slice(0, 8) + '...'}
                          </span>
                          <span className="text-[var(--color-text-secondary)]">
                            {new Date(b.date + 'T00:00:00').toLocaleDateString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ))}
                      {slotBookings.length > 3 && (
                        <p className="text-[10px] text-[var(--color-text-secondary)]">
                          +{slotBookings.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming bookings list */}
      {upcomingBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            All Upcoming Bookings
          </h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  <th className="px-4 py-2 font-semibold text-[var(--color-text-secondary)]">Date</th>
                  <th className="px-4 py-2 font-semibold text-[var(--color-text-secondary)]">Time</th>
                  <th className="px-4 py-2 font-semibold text-[var(--color-text-secondary)]">Student</th>
                  <th className="px-4 py-2 font-semibold text-[var(--color-text-secondary)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((booking) => {
                  const slot = slots.find((s) => s.id === booking.slot_id)
                  return (
                    <tr key={booking.id} className="border-b border-[var(--color-border)]">
                      <td className="px-4 py-2 text-[var(--color-text-primary)]">
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-PH', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                        {slot
                          ? `${formatTime12h(slot.start_time)} - ${formatTime12h(slot.end_time)}`
                          : '--'}
                      </td>
                      <td className="px-4 py-2 text-[var(--color-text-primary)]">
                        {booking.student_name ?? booking.student_id.slice(0, 8) + '...'}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={booking.status === 'confirmed' ? 'success' : 'warning'}
                          label={booking.status}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}
