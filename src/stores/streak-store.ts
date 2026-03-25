import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface StreakState {
  currentStreak: number
  longestStreak: number
  lastCheckIn: string | null
  todayCheckedIn: boolean
  recordCheckIn: () => void
  loadFromDb: () => Promise<void>
}

const STORAGE_KEY = 'uniportal_streak'

function loadStreak(): Pick<StreakState, 'currentStreak' | 'longestStreak' | 'lastCheckIn'> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  return { currentStreak: 0, longestStreak: 0, lastCheckIn: null }
}

function saveStreak(data: Pick<StreakState, 'currentStreak' | 'longestStreak' | 'lastCheckIn'>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* */ }
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().slice(0, 10) === dateStr
}

export const useStreakStore = create<StreakState>()((set, get) => {
  const saved = loadStreak()
  const today = getToday()
  const alreadyCheckedIn = saved.lastCheckIn === today

  return {
    currentStreak: saved.currentStreak,
    longestStreak: saved.longestStreak,
    lastCheckIn: saved.lastCheckIn,
    todayCheckedIn: alreadyCheckedIn,

    recordCheckIn: () => {
      const { lastCheckIn, currentStreak, longestStreak } = get()
      const today = getToday()
      if (lastCheckIn === today) return // Already checked in today

      let newStreak: number
      if (lastCheckIn && isYesterday(lastCheckIn)) {
        newStreak = currentStreak + 1
      } else {
        newStreak = 1 // Streak broken or first check-in
      }

      const newLongest = Math.max(longestStreak, newStreak)
      const state = { currentStreak: newStreak, longestStreak: newLongest, lastCheckIn: today }
      saveStreak(state)
      set({ ...state, todayCheckedIn: true })

      // Sync to Supabase in background (fire-and-forget)
      ;(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data: student } = await (supabase as any).from('students').select('id').eq('user_id', user.id).maybeSingle()
          if (!student) return
          await (supabase as any).from('check_ins').upsert({ student_id: student.id, check_in_date: today }, { onConflict: 'student_id,check_in_date' })
          await (supabase as any).from('streak_records').upsert({ student_id: student.id, current_streak: newStreak, longest_streak: newLongest, last_check_in: today }, { onConflict: 'student_id' })
        } catch { /* silent */ }
      })()
    },

    loadFromDb: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: student } = await (supabase as any).from('students').select('id').eq('user_id', user.id).maybeSingle()
        if (!student) return
        const { data: record } = await (supabase as any).from('streak_records').select('*').eq('student_id', student.id).maybeSingle()
        if (record) {
          const state = { currentStreak: record.current_streak, longestStreak: record.longest_streak, lastCheckIn: record.last_check_in }
          saveStreak(state)
          set({ ...state, todayCheckedIn: record.last_check_in === getToday() })
        }
      } catch { /* silent */ }
    },
  }
})
