import { useState, useEffect, useCallback } from 'react'
import { Search, UserPlus, Pencil, Shield, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Navigate } from 'react-router-dom'
import { AddUserModal } from './components/add-user-modal'
import { EditUserModal } from './components/edit-user-modal'
import type { UserRole } from '@/types/auth'
import type { Student, Faculty, AdminStaff } from '@/types/database'

export interface ManagedUser {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
  // Student-specific
  studentNumber?: string
  program?: string
  yearLevel?: number
  // Faculty-specific
  employeeId?: string
  department?: string
  // Admin-specific
  roleLevel?: string
}

const ROLE_ICONS: Record<UserRole, typeof Shield> = {
  admin: Shield,
  faculty: BookOpen,
  student: GraduationCap,
}

const ROLE_BADGE_VARIANT: Record<UserRole, 'info' | 'warning' | 'success'> = {
  admin: 'info',
  faculty: 'warning',
  student: 'success',
}

type FetchResult<T> = { data: T[] | null; error: unknown }

export default function AdminUsersPage() {
  const { role } = useAuthStore()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all three tables in parallel
      const [studentsResult, facultyResult, adminResult] = (await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('faculty').select('*'),
        supabase.from('admin_staff').select('*'),
      ])) as unknown as [FetchResult<Student>, FetchResult<Faculty>, FetchResult<AdminStaff>]

      const allUsers: ManagedUser[] = []

      // Map students
      if (studentsResult.data) {
        for (const s of studentsResult.data) {
          allUsers.push({
            id: s.id,
            userId: s.user_id,
            email: '', // Email is in auth.users — not directly accessible from client
            firstName: s.first_name,
            lastName: s.last_name,
            role: 'student',
            createdAt: s.created_at,
            studentNumber: s.student_number,
            program: s.program,
            yearLevel: s.year_level,
          })
        }
      }

      // Map faculty
      if (facultyResult.data) {
        for (const f of facultyResult.data) {
          allUsers.push({
            id: f.id,
            userId: f.user_id,
            email: '',
            firstName: f.first_name,
            lastName: f.last_name,
            role: 'faculty',
            createdAt: f.created_at,
            employeeId: f.employee_id,
            department: f.department,
          })
        }
      }

      // Map admin staff
      if (adminResult.data) {
        for (const a of adminResult.data) {
          allUsers.push({
            id: a.id,
            userId: a.user_id,
            email: '',
            firstName: a.first_name,
            lastName: a.last_name,
            role: 'admin',
            createdAt: a.created_at,
            roleLevel: a.role_level,
            department: a.department,
          })
        }
      }

      // Sort by creation date (newest first)
      allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setUsers(allUsers)
    } catch {
      // Silently handle — table may not exist in dev
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (role !== 'admin') return
    fetchUsers()
  }, [fetchUsers, role])

  // Admin-only guard — must be after all hooks
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Filter users based on search and role filter
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesSearch =
      !searchQuery.trim() ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesRole && matchesSearch
  })

  function handleEdit(user: ManagedUser) {
    setEditingUser(user)
    setEditModalOpen(true)
  }

  function getRoleDetail(user: ManagedUser): string {
    if (user.role === 'student') {
      return `${user.program ?? ''} - Year ${user.yearLevel ?? ''}`
    }
    if (user.role === 'faculty') {
      return user.department ?? ''
    }
    return `${user.roleLevel ?? ''} - ${user.department ?? ''}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          User Management
        </h1>
        <Button
          variant="accent"
          onClick={() => setAddModalOpen(true)}
          className="self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add User
        </Button>
      </div>

      {/* Search and filter bar */}
      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by name, email, student number, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] transition-colors duration-150 focus:border-[var(--color-accent)] focus:outline-none"
              aria-label="Search users"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'student', 'faculty', 'admin'] as const).map((filterRole) => (
              <button
                key={filterRole}
                type="button"
                onClick={() => setRoleFilter(filterRole)}
                className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-semibold transition-colors ${
                  roleFilter === filterRole
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                }`}
              >
                {filterRole === 'all' ? 'All' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* User count */}
      <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
      </p>

      {/* Users table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                  Role
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] sm:table-cell">
                  Details
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold text-[var(--color-text-primary)] md:table-cell">
                  Created
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]">
                    <td className="px-4 py-3">
                      <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-border)]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-20 animate-pulse rounded bg-[var(--color-border)]" />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="h-5 w-40 animate-pulse rounded bg-[var(--color-border)]" />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="h-5 w-24 animate-pulse rounded bg-[var(--color-border)]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-8 animate-pulse rounded bg-[var(--color-border)]" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--color-text-secondary)]"
                  >
                    {searchQuery || roleFilter !== 'all'
                      ? 'No users match your search criteria.'
                      : 'No users found. Click "Add User" to create the first user.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role]
                  return (
                    <tr
                      key={`${user.role}-${user.id}`}
                      className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <RoleIcon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-text-primary)]">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {user.email || user.studentNumber || user.employeeId || user.userId.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={ROLE_BADGE_VARIANT[user.role]}
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        />
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--color-text-secondary)] sm:table-cell">
                        {getRoleDetail(user)}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--color-text-secondary)] md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                          aria-label={`Edit ${user.firstName} ${user.lastName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onUserAdded={fetchUsers}
      />
      <EditUserModal
        open={editModalOpen}
        user={editingUser}
        onClose={() => {
          setEditModalOpen(false)
          setEditingUser(null)
        }}
        onUserUpdated={fetchUsers}
      />
    </div>
  )
}
