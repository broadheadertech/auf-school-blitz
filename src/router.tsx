/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/page-layout'
import { AuthLayout } from '@/components/layout/auth-layout'
import { ErrorBoundary } from '@/components/error-boundary'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const AcademicManagementPage = lazy(() => import('@/pages/admin/academic'))
const SectionsManagementPage = lazy(() => import('@/pages/admin/sections'))
const AcademicSettingsPage = lazy(() => import('@/pages/admin/settings'))
const GradesPage = lazy(() => import('@/pages/grades'))
const CurriculumPage = lazy(() => import('@/pages/curriculum'))
const EnrollmentPage = lazy(() => import('@/pages/enrollment'))
const PaymentsPage = lazy(() => import('@/pages/payments'))
const NewsPage = lazy(() => import('@/pages/news'))
const EventsPage = lazy(() => import('@/pages/events'))
const ProfilePage = lazy(() => import('@/pages/profile'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'))
const AdminUsersPage = lazy(() => import('@/pages/admin/users'))
const GradeSubmissionPage = lazy(() => import('@/pages/grades/submit'))
const SchedulePage = lazy(() => import('@/pages/schedule'))
const GpaCalculatorPage = lazy(() => import('@/pages/gpa-calculator'))
const DocumentsPage = lazy(() => import('@/pages/documents'))
const ClearancePage = lazy(() => import('@/pages/clearance'))
const ChatPage = lazy(() => import('@/pages/chat'))
const ReviewsPage = lazy(() => import('@/pages/reviews'))
const AttendancePage = lazy(() => import('@/pages/attendance'))
const MaterialsPage = lazy(() => import('@/pages/materials'))
const ConsultationsPage = lazy(() => import('@/pages/consultations'))
const AdminAnnouncementsPage = lazy(() => import('@/pages/admin/announcements'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics'))
const AdminScholarshipsPage = lazy(() => import('@/pages/admin/scholarships'))
const AdminAuditPage = lazy(() => import('@/pages/admin/audit'))
const StudyGroupsPage = lazy(() => import('@/pages/study-groups'))
const LostFoundPage = lazy(() => import('@/pages/lost-found'))
const LeaderboardPage = lazy(() => import('@/pages/leaderboard'))
const CampusMapPage = lazy(() => import('@/pages/campus-map'))

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 w-48 rounded-[var(--radius-md)] bg-[var(--color-border)]" />
      <div className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
      <div className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
    </div>
  )
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="animate-pulse space-y-4 w-full max-w-md px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-[var(--color-border)]" />
          <div className="h-8 w-32 rounded-[var(--radius-md)] bg-[var(--color-border)]" />
        </div>
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
      </div>
    </div>
  )
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

/**
 * Handles magic link auth callbacks.
 * Supabase appends tokens as hash fragments; onAuthStateChange picks them up.
 * This route shows a loading state while the token is processed, then redirects.
 * If the link is expired or invalid, an error message is displayed.
 */
function AuthCallback() {
  const navigate = useNavigate()
  const { user, initialized, role, hasCompletedOnboarding } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check URL hash for error parameters (Supabase puts them in the hash fragment)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const errorDescription = params.get('error_description')
      if (errorDescription) {
        if (errorDescription.toLowerCase().includes('expired')) {
          setAuthError('This link has expired. Please request a new one.')
        } else {
          setAuthError(errorDescription)
        }
        return
      }
    }
  }, [])

  useEffect(() => {
    if (authError) return
    if (!initialized) return

    if (user) {
      if (role === 'student' && !hasCompletedOnboarding) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else {
      // No user after initialization — tokens were invalid or missing
      navigate('/login', { replace: true })
    }
  }, [user, initialized, navigate, authError, role, hasCompletedOnboarding])

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error)]/10 px-6 py-4">
            <p className="text-sm font-semibold text-[var(--color-error)]">{authError}</p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return <AuthSkeleton />
}

/**
 * Protects routes that require authentication.
 * Redirects to /login if the user is not authenticated.
 */
function ProtectedRoute() {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return <PageSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/**
 * Wraps public-only routes (e.g. /login).
 * Redirects authenticated users to /dashboard or /onboarding.
 */
function PublicOnlyRoute() {
  const { user, initialized, role, hasCompletedOnboarding } = useAuthStore()

  if (!initialized) {
    return <AuthSkeleton />
  }

  if (user) {
    if (role === 'student' && !hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

/**
 * Redirects students who haven't completed onboarding from dashboard routes.
 * Non-student roles and onboarding-completed students pass through.
 */
function OnboardingGuard() {
  const { role, hasCompletedOnboarding } = useAuthStore()

  if (role === 'student' && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

/**
 * Guards routes to only allow specific roles.
 * Redirects unauthorized users to /dashboard.
 */
function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { role } = useAuthStore()

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: (
              <LazyPage>
                <LoginPage />
              </LazyPage>
            ),
          },
          {
            path: '/forgot-password',
            element: (
              <LazyPage>
                <ForgotPasswordPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/reset-password',
        element: (
          <LazyPage>
            <ResetPasswordPage />
          </LazyPage>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/onboarding',
        element: (
          <LazyPage>
            <OnboardingPage />
          </LazyPage>
        ),
      },
      {
        element: <OnboardingGuard />,
        children: [
          {
            element: <PageLayout />,
            children: [
              {
                path: '/',
                element: (
                  <LazyPage>
                    <DashboardPage />
                  </LazyPage>
                ),
              },
              {
                path: '/dashboard',
                element: (
                  <LazyPage>
                    <DashboardPage />
                  </LazyPage>
                ),
              },
              {
                path: '/grades',
                element: (
                  <LazyPage>
                    <GradesPage />
                  </LazyPage>
                ),
              },
              {
                path: '/curriculum',
                element: (
                  <LazyPage>
                    <CurriculumPage />
                  </LazyPage>
                ),
              },
              {
                path: '/enrollment',
                element: (
                  <LazyPage>
                    <EnrollmentPage />
                  </LazyPage>
                ),
              },
              {
                path: '/payments',
                element: (
                  <LazyPage>
                    <PaymentsPage />
                  </LazyPage>
                ),
              },
              {
                path: '/news',
                element: (
                  <LazyPage>
                    <NewsPage />
                  </LazyPage>
                ),
              },
              {
                path: '/events',
                element: (
                  <LazyPage>
                    <EventsPage />
                  </LazyPage>
                ),
              },
              {
                path: '/profile',
                element: (
                  <LazyPage>
                    <ProfilePage />
                  </LazyPage>
                ),
              },
              {
                path: '/schedule',
                element: <LazyPage><SchedulePage /></LazyPage>,
              },
              {
                path: '/gpa-calculator',
                element: <LazyPage><GpaCalculatorPage /></LazyPage>,
              },
              {
                path: '/documents',
                element: <LazyPage><DocumentsPage /></LazyPage>,
              },
              {
                path: '/clearance',
                element: <LazyPage><ClearancePage /></LazyPage>,
              },
              {
                path: '/chat',
                element: <LazyPage><ChatPage /></LazyPage>,
              },
              {
                path: '/reviews',
                element: <LazyPage><ReviewsPage /></LazyPage>,
              },
              {
                path: '/consultations',
                element: <LazyPage><ConsultationsPage /></LazyPage>,
              },
              {
                path: '/study-groups',
                element: <LazyPage><StudyGroupsPage /></LazyPage>,
              },
              {
                path: '/lost-found',
                element: <LazyPage><LostFoundPage /></LazyPage>,
              },
              {
                path: '/leaderboard',
                element: <LazyPage><LeaderboardPage /></LazyPage>,
              },
              {
                path: '/campus-map',
                element: <LazyPage><CampusMapPage /></LazyPage>,
              },
              {
                element: <RoleGuard allowedRoles={['faculty', 'admin']} />,
                children: [
                  {
                    path: '/grades/submit',
                    element: <LazyPage><GradeSubmissionPage /></LazyPage>,
                  },
                  {
                    path: '/attendance',
                    element: <LazyPage><AttendancePage /></LazyPage>,
                  },
                  {
                    path: '/materials',
                    element: <LazyPage><MaterialsPage /></LazyPage>,
                  },
                ],
              },
              {
                element: <RoleGuard allowedRoles={['admin']} />,
                children: [
                  {
                    path: '/admin/users',
                    element: (
                      <LazyPage>
                        <AdminUsersPage />
                      </LazyPage>
                    ),
                  },
                  {
                    path: '/admin/academic',
                    element: (
                      <LazyPage>
                        <AcademicManagementPage />
                      </LazyPage>
                    ),
                  },
                  {
                    path: '/admin/sections',
                    element: (
                      <LazyPage>
                        <SectionsManagementPage />
                      </LazyPage>
                    ),
                  },
                  {
                    path: '/admin/settings',
                    element: <LazyPage><AcademicSettingsPage /></LazyPage>,
                  },
                  {
                    path: '/admin/announcements',
                    element: <LazyPage><AdminAnnouncementsPage /></LazyPage>,
                  },
                  {
                    path: '/admin/analytics',
                    element: <LazyPage><AdminAnalyticsPage /></LazyPage>,
                  },
                  {
                    path: '/admin/scholarships',
                    element: <LazyPage><AdminScholarshipsPage /></LazyPage>,
                  },
                  {
                    path: '/admin/audit',
                    element: <LazyPage><AdminAuditPage /></LazyPage>,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
