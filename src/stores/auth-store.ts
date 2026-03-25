import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole, UserProfile } from '@/types/auth'

function getOnboardingKey(userId?: string): string {
  return userId
    ? `uniportal_onboarding_completed_${userId}`
    : 'uniportal_onboarding_completed'
}

function getOnboardingCompleted(userId?: string): boolean {
  try {
    return localStorage.getItem(getOnboardingKey(userId)) === 'true'
  } catch {
    return false
  }
}

function setOnboardingCompleted(value: boolean, userId?: string): void {
  try {
    localStorage.setItem(getOnboardingKey(userId), String(value))
  } catch {
    // localStorage unavailable
  }
}

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  availableRoles: UserRole[]
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  error: string | null
  hasCompletedOnboarding: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  sendMagicLink: (email: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  logout: () => Promise<void>
  getUserRole: (userId: string) => Promise<UserRole>
  fetchAvailableRoles: (userId: string) => Promise<UserRole[]>
  switchRole: (role: UserRole) => Promise<void>
  fetchProfile: (userId: string, role: UserRole) => Promise<UserProfile | null>
  initialize: () => (() => void)
  setError: (error: string | null) => void
  completeOnboarding: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  session: null,
  role: null,
  availableRoles: [],
  profile: null,
  loading: false,
  initialized: false,
  error: null,
  hasCompletedOnboarding: getOnboardingCompleted(),

  setError: (error) => set({ error }),

  completeOnboarding: () => {
    const userId = get().user?.id
    setOnboardingCompleted(true, userId)
    set({ hasCompletedOnboarding: true })
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false, error: 'Invalid email or password' })
        return
      }

      const user = data.user
      const session = data.session

      // Detect role and available roles
      const role = await get().getUserRole(user.id)
      const availableRoles = await get().fetchAvailableRoles(user.id)

      // Fetch profile
      const profile = await get().fetchProfile(user.id, role)

      set({
        user,
        session,
        role,
        availableRoles,
        profile,
        loading: false,
        initialized: true,
        error: null,
        hasCompletedOnboarding: role !== 'student' || getOnboardingCompleted(user.id),
      })
    } catch {
      set({ loading: false, error: 'An unexpected error occurred. Please try again.' })
    }
  },

  resetPassword: async (email: string): Promise<boolean> => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        set({ loading: false, error: error.message })
        return false
      }

      set({ loading: false, error: null })
      return true
    } catch {
      set({ loading: false, error: 'An unexpected error occurred. Please try again.' })
      return false
    }
  },

  updatePassword: async (password: string): Promise<boolean> => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        set({ loading: false, error: error.message })
        return false
      }

      set({ loading: false, error: null })
      return true
    } catch {
      set({ loading: false, error: 'An unexpected error occurred. Please try again.' })
      return false
    }
  },

  sendMagicLink: async (email: string): Promise<boolean> => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })

      if (error) {
        set({ loading: false, error: error.message })
        return false
      }

      set({ loading: false, error: null })
      return true
    } catch {
      set({ loading: false, error: 'An unexpected error occurred. Please try again.' })
      return false
    }
  },

  logout: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      role: null,
      availableRoles: [],
      profile: null,
      loading: false,
      error: null,
    })
  },

  getUserRole: async (userId: string): Promise<UserRole> => {
    // Check admin first (smallest table, highest privilege)
    const { data: admin } = await supabase
      .from('admin_staff')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (admin) return 'admin'

    // Check faculty
    const { data: faculty } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (faculty) return 'faculty'

    // Default to student
    return 'student'
  },

  fetchAvailableRoles: async (userId: string): Promise<UserRole[]> => {
    const roles: UserRole[] = []

    // Check all three tables in parallel
    const [adminResult, facultyResult, studentResult] = await Promise.all([
      supabase.from('admin_staff').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('faculty').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('students').select('id').eq('user_id', userId).maybeSingle(),
    ])

    if (adminResult.data) roles.push('admin')
    if (facultyResult.data) roles.push('faculty')
    if (studentResult.data) roles.push('student')

    // If no roles found, default to student (consistent with getUserRole)
    if (roles.length === 0) roles.push('student')

    return roles
  },

  switchRole: async (role: UserRole): Promise<void> => {
    const { user, availableRoles } = get()
    if (!user) return
    if (!availableRoles.includes(role)) return

    set({ loading: true, error: null })
    try {
      const profile = await get().fetchProfile(user.id, role)
      set({ role, profile, loading: false })
    } catch {
      set({ loading: false, error: 'Failed to switch role. Please try again.' })
    }
  },

  fetchProfile: async (userId: string, role: UserRole): Promise<UserProfile | null> => {
    const table = role === 'admin' ? 'admin_staff' : role === 'faculty' ? 'faculty' : 'students'
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .single()
    return data ?? null
  },

  initialize: () => {
    // Use onAuthStateChange with INITIAL_SESSION to avoid race conditions.
    // This replaces the separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED'
      ) {
        if (session?.user) {
          // Skip duplicate hydration if login() already set the user
          const currentUser = get().user
          if (currentUser?.id === session.user.id && get().initialized) return

          const role = await get().getUserRole(session.user.id)
          const availableRoles = await get().fetchAvailableRoles(session.user.id)
          const profile = await get().fetchProfile(session.user.id, role)
          set({
            user: session.user,
            session,
            role,
            availableRoles,
            profile,
            hasCompletedOnboarding: getOnboardingCompleted(session.user.id),
            initialized: true,
          })
        } else {
          set({ initialized: true })
        }
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          session: null,
          role: null,
          availableRoles: [],
          profile: null,
          initialized: true,
        })
      }
    })

    // Return unsubscribe for cleanup (handles React StrictMode double-mount)
    return () => subscription.unsubscribe()
  },
}))
