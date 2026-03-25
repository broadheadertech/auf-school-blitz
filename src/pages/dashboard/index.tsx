import { useAuthStore } from '@/stores/auth-store'
import { StudentDashboard } from './student-dashboard'
import { FacultyDashboard } from './faculty-dashboard'
import { AdminDashboard } from './admin-dashboard'

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role)

  if (role === 'student') return <StudentDashboard />
  if (role === 'faculty') return <FacultyDashboard />
  return <AdminDashboard />
}
