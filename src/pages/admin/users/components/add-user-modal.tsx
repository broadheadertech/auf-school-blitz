import { type FormEvent, useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { PROGRAMS } from '@/utils/constants'
import type { UserRole } from '@/types/auth'

interface AddUserModalProps {
  open: boolean
  onClose: () => void
  onUserAdded: () => void
}

interface FormData {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  // Student fields
  studentNumber: string
  program: string
  yearLevel: number
  // Faculty fields
  employeeId: string
  department: string
  // Admin fields
  roleLevel: string
  adminDepartment: string
}

const INITIAL_FORM: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  role: 'student',
  studentNumber: '',
  program: PROGRAMS[0].code,
  yearLevel: 1,
  employeeId: '',
  department: '',
  roleLevel: 'staff',
  adminDepartment: '',
}

export function AddUserModal({ open, onClose, onUserAdded }: AddUserModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setError('Email, first name, and last name are required.')
      return
    }

    setLoading(true)

    try {
      // NOTE: Full user creation requires a Supabase Edge Function using the service_role key
      // to create the auth.users record first, then insert the profile row with the real user_id.
      // For MVP, this is a UI placeholder — the insert will fail with a FK violation since
      // crypto.randomUUID() does not correspond to a real auth.users row.
      // TODO: Replace with edge function call: POST /functions/v1/admin-create-user

      if (form.role === 'student') {
        if (!form.studentNumber.trim()) {
          setError('Student number is required.')
          setLoading(false)
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase.from('students') as any).insert({
          user_id: crypto.randomUUID(), // Placeholder — real user_id comes from auth.users
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          student_number: form.studentNumber.trim(),
          program: form.program,
          year_level: form.yearLevel,
        })
        if (insertError) throw insertError
      } else if (form.role === 'faculty') {
        if (!form.employeeId.trim()) {
          setError('Employee ID is required.')
          setLoading(false)
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase.from('faculty') as any).insert({
          user_id: crypto.randomUUID(),
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          employee_id: form.employeeId.trim(),
          department: form.department.trim(),
        })
        if (insertError) throw insertError
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase.from('admin_staff') as any).insert({
          user_id: crypto.randomUUID(),
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          role_level: form.roleLevel,
          department: form.adminDepartment.trim(),
        })
        if (insertError) throw insertError
      }

      onUserAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user. Please try again.')
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
      aria-label="Add new user"
    >
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Add New User
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

        <div className="mb-3 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Note: Creating the authentication account requires a backend edge function. This form
          creates the profile record only.
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            placeholder="user@university.edu.ph"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Juan"
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="Dela Cruz"
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="role-select"
              className="text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Role <span className="text-[var(--color-error)] ml-0.5">*</span>
            </label>
            <select
              id="role-select"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value as UserRole)}
              className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Conditional fields based on role */}
          {form.role === 'student' && (
            <>
              <Input
                label="Student Number"
                placeholder="2024-00001"
                value={form.studentNumber}
                onChange={(e) => updateField('studentNumber', e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="program-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Program <span className="text-[var(--color-error)] ml-0.5">*</span>
                </label>
                <select
                  id="program-select"
                  value={form.program}
                  onChange={(e) => updateField('program', e.target.value)}
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
                  htmlFor="year-level-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Year Level <span className="text-[var(--color-error)] ml-0.5">*</span>
                </label>
                <select
                  id="year-level-select"
                  value={form.yearLevel}
                  onChange={(e) => updateField('yearLevel', Number(e.target.value))}
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

          {form.role === 'faculty' && (
            <>
              <Input
                label="Employee ID"
                placeholder="EMP-0001"
                value={form.employeeId}
                onChange={(e) => updateField('employeeId', e.target.value)}
                required
              />
              <Input
                label="Department"
                placeholder="Computer Science"
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
              />
            </>
          )}

          {form.role === 'admin' && (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="role-level-select"
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Role Level <span className="text-[var(--color-error)] ml-0.5">*</span>
                </label>
                <select
                  id="role-level-select"
                  value={form.roleLevel}
                  onChange={(e) => updateField('roleLevel', e.target.value)}
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base text-[var(--color-text-primary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <Input
                label="Department"
                placeholder="Registrar"
                value={form.adminDepartment}
                onChange={(e) => updateField('adminDepartment', e.target.value)}
              />
            </>
          )}

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" loading={loading} className="flex-1">
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
