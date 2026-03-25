import { type FormEvent, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import aufLogoFull from '@/images/logo-2.png'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EnrollmentBanner } from '@/components/enrollment-banner'
import { useAuthStore } from '@/stores/auth-store'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginMode = 'password' | 'magic-link'

export default function LoginPage() {
  const location = useLocation()
  const { login, sendMagicLink, loading, error, setError } = useAuthStore()

  const successMessage = (location.state as { message?: string } | null)?.message ?? null

  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

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

  function validateForm(): boolean {
    let valid = validateEmail()

    if (mode === 'password') {
      if (!password) {
        setPasswordError('Password is required')
        valid = false
      } else {
        setPasswordError(null)
      }
    }

    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    if (mode === 'magic-link') {
      const success = await sendMagicLink(email)
      if (success) {
        setMagicLinkSent(true)
      }
      return
    }

    await login(email, password)
  }

  function switchMode(newMode: LoginMode) {
    setMode(newMode)
    setError(null)
    setEmailError(null)
    setPasswordError(null)
    setMagicLinkSent(false)
  }

  // Magic link sent confirmation view
  if (magicLinkSent) {
    return (
      <>
      <EnrollmentBanner />
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <Mail className="h-7 w-7 text-[var(--color-accent)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Check your email
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            We sent a login link to{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>.
            Click the link in your email to sign in.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            The link will expire in 15 minutes.
          </p>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMagicLinkSent(false)}
            >
              Send another link
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
              onClick={() => switchMode('password')}
            >
              Back to password login
            </button>
          </div>
        </div>
      </Card>
      </>
    )
  }

  return (
    <>
    <EnrollmentBanner />
    <div className="flex flex-col items-center gap-3 mb-6">
      <img src={aufLogoFull} alt="AUF Logo" className="h-20 w-20 object-contain" />
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-display">Angeles University Foundation</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">Student Portal</p>
    </div>
    <Card className="p-6">
      {/* Mode toggle tabs */}
      <div className="mb-4 flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-1">
        <button
          type="button"
          className={`flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
            mode === 'password'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          onClick={() => switchMode('password')}
        >
          Password
        </button>
        <button
          type="button"
          className={`flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
            mode === 'magic-link'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          onClick={() => switchMode('magic-link')}
        >
          Magic Link
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {successMessage && (
          <div
            role="status"
            className="rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]"
          >
            {successMessage}
          </div>
        )}

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

        {mode === 'password' && (
          <>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(null)
              }}
              error={passwordError ?? undefined}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="mt-2 w-full"
            >
              Sign In
            </Button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
              >
                Forgot Password?
              </Link>
            </div>
          </>
        )}

        {mode === 'magic-link' && (
          <>
            <p className="text-sm text-[var(--color-text-secondary)]">
              We&apos;ll send a login link to your email. No password needed.
            </p>

            <Button
              type="submit"
              variant="accent"
              loading={loading}
              className="mt-2 w-full"
            >
              Send Magic Link
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-150"
                onClick={() => switchMode('password')}
              >
                Back to password login
              </button>
            </div>
          </>
        )}
      </form>
    </Card>
    </>
  )
}
