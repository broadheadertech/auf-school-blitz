import type { User, Session } from '@supabase/supabase-js'
import type { Student, Faculty, AdminStaff } from './database'

export type UserRole = 'student' | 'faculty' | 'admin'

export type UserProfile = Student | Faculty | AdminStaff

export interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  error: string | null
}
