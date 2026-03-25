import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error, setError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  function validateEmail(): boolean {
    if (!email.trim()) {
      setEmailError('Email is required')
      return false
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError('Enter a valid email address')
      return false
    }
    setEmailError(null)
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validateEmail()) return

    const success = await resetPassword(email)
    if (success) {
      setResetSent(true)
    }
  }

  if (resetSent) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <Mail className="h-7 w-7 text-[var(--color-accent)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Check your email
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            We sent a password reset link to{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>.
            Click the link in your email to reset your password.
          </p>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setResetSent(false)
                setError(null)
              }}
            >
              Send another link
            </Button>
            <Link
              to="/login"
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
            >
              Back to login
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
        Forgot Password
      </h2>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@university.edu.ph"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(null)
          }}
          error={emailError ?? undefined}
          required
          autoComplete="email"
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="mt-2 w-full"
        >
          Send Reset Link
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
          >
            Back to login
          </Link>
        </div>
      </form>
    </Card>
  )
}
