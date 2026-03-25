import { useAuthStore } from '@/stores/auth-store'
import { PROGRAMS, SEMESTERS } from '@/utils/constants'
import type { Student, Faculty, AdminStaff } from '@/types/database'

export function WelcomeBanner() {
  const { profile, role } = useAuthStore()

  let firstName = 'User'
  let lastName = ''
  let subtitle = ''

  if (role === 'student' && profile) {
    const s = profile as Student
    firstName = s.first_name
    lastName = s.last_name
    const programName = PROGRAMS.find((p) => p.code === s.program)?.name ?? s.program
    subtitle = `${s.program} — ${programName} | Year ${s.year_level} | ${SEMESTERS[0]}`
  } else if (role === 'faculty' && profile) {
    const f = profile as Faculty
    firstName = f.first_name
    lastName = f.last_name
    subtitle = `Faculty — ${f.department}`
  } else if (role === 'admin' && profile) {
    const a = profile as AdminStaff
    firstName = a.first_name
    lastName = a.last_name
    subtitle = `${a.role_level === 'superadmin' ? 'Superadmin' : 'Admin'} — ${a.department}`
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] p-5 text-white shadow-[var(--shadow-md)]">
      <p className="text-sm text-white/70">Welcome back,</p>
      <h1 className="font-display text-2xl font-bold mt-1">
        {firstName} {lastName}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      )}
    </div>
  )
}
