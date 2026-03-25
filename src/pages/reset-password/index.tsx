import { type FormEvent, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, loading, error, setError } = useAuthStore()
  const mountedRef = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check for error in URL hash (Supabase appends errors as hash fragments)
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const errorDescription = params.get('error_description')
      if (errorDescription) {
        if (errorDescription.toLowerCase().includes('expired')) {
          setError('This reset link has expired. Please request a new one.')
        } else {
          setError(errorDescription)
        }
      }
    }
  }, [setError])

  function validateForm(): boolean {
    let valid = true

    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      valid = false
    } else {
      setPasswordError(null)
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password')
      valid = false
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      valid = false
    } else {
      setConfirmError(null)
    }

    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    const result = await updatePassword(password)
    if (result) {
      setSuccess(true)
      // Redirect to login after a short delay
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          navigate('/login', {
            replace: true,
            state: { message: 'Password updated successfully. Please sign in with your new password.' },
          })
        }
      }, 2000)
      timerRef.current = timer
    }
  }

  if (success) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/15">
            <CheckCircle className="h-7 w-7 text-[var(--color-success)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Password updated successfully
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Redirecting you to the login page...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
        Reset Password
      </h2>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Enter your new password below.
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
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError(null)
          }}
          error={passwordError ?? undefined}
          helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
          required
          autoComplete="new-password"
          autoFocus
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (confirmError) setConfirmError(null)
          }}
          error={confirmError ?? undefined}
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="mt-2 w-full"
        >
          Update Password
        </Button>
      </form>
    </Card>
  )
}
