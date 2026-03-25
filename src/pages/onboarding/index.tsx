import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PROGRAMS } from '@/utils/constants'
import type { Student } from '@/types/database'
import {
  User,
  ClipboardList,
  Rocket,
  ChevronLeft,
  CheckCircle,
  Circle,
} from 'lucide-react'

const STEPS = [
  { number: 1, label: 'Verify Your Info', icon: User },
  { number: 2, label: 'Enrollment Checklist', icon: ClipboardList },
  { number: 3, label: 'Get Started', icon: Rocket },
] as const

const CHECKLIST_ITEMS = [
  'Set your schedule preferences',
  'Select your subjects for the semester',
  'Confirm your enrollment',
  'Pay tuition and fees',
] as const

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${currentStep} of 3`}>
      {STEPS.map((step) => (
        <div key={step.number} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
              step.number < currentStep
                ? 'bg-[var(--color-success)] text-white'
                : step.number === currentStep
                  ? 'bg-[var(--color-accent)] text-[var(--color-primary)]'
                  : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {step.number < currentStep ? (
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
            ) : (
              step.number
            )}
          </div>
          <span
            className={`hidden text-sm font-medium sm:inline ${
              step.number === currentStep
                ? 'text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            {step.label}
          </span>
          {step.number < 3 && (
            <div
              className={`h-0.5 w-8 sm:w-12 transition-colors duration-200 ${
                step.number < currentStep
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-border)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StepVerify({ onNext }: { onNext: () => void }) {
  const { profile, role } = useAuthStore()
  const studentProfile = role === 'student' ? (profile as Student | null) : null

  const firstName = studentProfile?.first_name ?? 'Student'
  const lastName = studentProfile?.last_name ?? ''
  const programCode = studentProfile?.program ?? 'BSCS'
  const yearLevel = studentProfile?.year_level ?? 1

  const programName =
    PROGRAMS.find((p) => p.code === programCode)?.name ?? programCode

  return (
    <Card className="mx-auto max-w-lg">
      <div className="space-y-6 p-2">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-lighter)]">
            <User className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-text)]">
            Verify Your Info
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Please confirm that your information below is correct.
          </p>
        </div>

        <div className="space-y-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Name</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {firstName} {lastName}
            </span>
          </div>
          <div className="h-px bg-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Program</span>
            <div className="flex items-center gap-2">
              <Badge variant="info" label={programCode} />
              <span className="hidden text-sm font-semibold text-[var(--color-text)] sm:inline">
                {programName}
              </span>
            </div>
          </div>
          <div className="h-px bg-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Year Level</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Year {yearLevel}
            </span>
          </div>
        </div>

        <Button variant="primary" className="w-full" onClick={onNext}>
          This looks correct
        </Button>
      </div>
    </Card>
  )
}

function StepChecklist({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="mx-auto max-w-lg">
      <div className="space-y-6 p-2">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-lighter)]">
            <ClipboardList className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-text)]">
            Enrollment Checklist
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Here is what you will need to do this semester.
          </p>
        </div>

        <ul className="space-y-3" role="list">
          {CHECKLIST_ITEMS.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3"
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-[var(--color-primary)]">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-[var(--color-text)]">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button variant="primary" className="flex-1" onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </Card>
  )
}

function StepGetStarted({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuthStore()

  function handleStartEnrollment() {
    completeOnboarding()
    navigate('/enrollment', { replace: true })
  }

  function handleGoToDashboard() {
    completeOnboarding()
    navigate('/dashboard', { replace: true })
  }

  return (
    <Card className="mx-auto max-w-lg">
      <div className="space-y-6 p-2">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-lighter)]">
            <Rocket className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-text)]">
            You are all set!
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            You can start your enrollment now or explore the dashboard first.
          </p>
        </div>

        <div className="space-y-3">
          <Button variant="accent" className="w-full" onClick={handleStartEnrollment}>
            Start Enrollment
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleGoToDashboard}>
            Go to Dashboard
          </Button>
        </div>

        <div className="pt-2">
          <Button variant="ghost" className="w-full" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { hasCompletedOnboarding } = useAuthStore()

  // If already completed, redirect to dashboard
  if (hasCompletedOnboarding) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 text-center">
            <h1 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              Welcome to AUF Portal
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Step {currentStep} of 3
            </p>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        {currentStep === 1 && (
          <StepVerify onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <StepChecklist
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepGetStarted onBack={() => setCurrentStep(2)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <Circle
              key={step}
              className={`h-2 w-2 ${
                step === currentStep
                  ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                  : step < currentStep
                    ? 'fill-[var(--color-success)] text-[var(--color-success)]'
                    : 'fill-[var(--color-border)] text-[var(--color-border)]'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </footer>
    </div>
  )
}
