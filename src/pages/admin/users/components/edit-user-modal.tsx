import { type FormEvent, useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { PROGRAMS } from '@/utils/constants'
import type { UserRole } from '@/types/auth'
import type { ManagedUser } from '../index'

interface EditUserModalProps {
  open: boolean
  user: ManagedUser | null
  onClose: () => void
  onUserUpdated: () => void
}

export function EditUserModal({ open, user, onClose, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Form state — populated from user data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<UserRole>('student')

  // Student fields
  const [studentNumber, setStudentNumber] = useState('')
  const [program, setProgram] = useState<string>(PROGRAMS[0].code)
  const [yearLevel, setYearLevel] = useState(1)

  // Faculty fields
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')

  // Admin fields
  const [roleLevel, setRoleLevel] = useState('staff')
  const [adminDepartment, setAdminDepartment] = useState('')

  useEffect(() => {
    if (open && user) {
      setError(null)
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setRole(user.role)

      if (user.role === 'student') {
        setStudentNumber(user.studentNumber ?? '')
        setProgram(user.program ?? PROGRAMS[0].code)
        setYearLevel(user.yearLevel ?? 1)
      } else if (user.role === 'faculty') {
        setEmployeeId(user.employeeId ?? '')
        setDepartment(user.department ?? '')
      } else {
        setRoleLevel(user.roleLevel ?? 'staff')
        setAdminDepartment(user.department ?? '')
      }
    }
  }, [open, user])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !user) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    setLoading(true)
    try {
      // If the role changed, we need to handle table migration
      // For MVP: update the current table record
      if (user.role === 'student') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('students') as any)
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            student_number: studentNumber.trim(),
            program,
            year_level: yearLevel,
          })
          .eq('id', user.id)
        if (updateError) throw updateError
      } else if (user.role === 'faculty') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('faculty') as any)
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            employee_id: employeeId.trim(),
            department: department.trim(),
          })
          .eq('id', user.id)
        if (updateError) throw updateError
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('admin_staff') as any)
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role_level: roleLevel,
            department: adminDepartment.trim(),
          })
          .eq('id', user.id)
        if (updateError) throw updateError
      }

      onUserUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Edit user"
    >
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Edit User
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={user.email}
            disabled
            helperText="Email cannot be changed from this form."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-role-select"
              className="text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Role
            </label>
            <select
              id="edit-role-select"
              value={role}
              disabled
              className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-secondary)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Role change requires creating a new record in the target table.
            </p>
          </div>

          {/* Role-specific fields */}
          {user.role === 'student' && (
            <>
              <Input
                label="Student Number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="edit-program-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Program
                </label>
                <select
                  id="edit-program-select"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
                >
                  {PROGRAMS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="edit-year-level-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Year Level
                </label>
                <select
                  id="edit-year-level-select"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(Number(e.target.value))}
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </>
          )}

          {user.role === 'faculty' && (
            <>
              <Input
                label="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </>
          )}

          {user.role === 'admin' && (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="edit-role-level-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Role Level
                </label>
                <select
                  id="edit-role-level-select"
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value)}
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <Input
                label="Department"
                value={adminDepartment}
                onChange={(e) => setAdminDepartment(e.target.value)}
              />
            </>
          )}

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" loading={loading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
