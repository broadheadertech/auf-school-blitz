import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <GraduationCap className="h-12 w-12 text-[var(--color-accent)]" />
          <h1 className="text-center text-[var(--color-primary)]">UniPortal</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            University Information & Student Portal
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
