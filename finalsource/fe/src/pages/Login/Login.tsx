import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

type FieldName = 'email' | 'password'
type FieldErrors = Partial<Record<FieldName, string>>

interface ApiErrorResponse {
  message?: string | string[]
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<Record<FieldName, string>>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)

  const updateField = (name: FieldName, value: string) => {
    setFormData((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {}
    const email = formData.email.trim()
    if (!email) errors.email = 'Email address is required.'
    else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
    if (!formData.password) errors.password = 'Password is required.'
    return errors
  }

  const applyServerValidation = (messages: string[]) => {
    const nextErrors: FieldErrors = {}
    const remaining: string[] = []
    for (const message of messages) {
      const normalized = message.toLowerCase()
      if (normalized.includes('email')) nextErrors.email ??= message
      else if (normalized.includes('password')) nextErrors.password ??= message
      else remaining.push(message)
    }
    setFieldErrors(nextErrors)
    if (remaining.length) setFormError(remaining.join(' '))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setFieldErrors({})
    setFormError('')
    setIsLoading(true)
    try {
      await login({ email: formData.email.trim(), password: formData.password })
      navigate('/')
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
        const message = error.response.data?.message
        const messages = Array.isArray(message) ? message : message ? [message] : []
        if (error.response.status === 400 && messages.length) applyServerValidation(messages)
        else if (messages.length) setFormError(messages.join(' '))
        else setFormError('Login could not be completed. Please try again.')
      } else {
        setFormError(error instanceof Error ? error.message : 'Login could not be completed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 py-16 text-[#191d23] sm:py-24 lg:py-40">
      <div className="mx-auto w-full max-w-[400px]">
        <h1 className="mb-16 text-center font-sans text-[40px] font-extrabold leading-8 tracking-[0.08em] text-[#299d91]">
          FINE<span className="font-medium">bank.</span>IO
        </h1>

        {formError && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#b42318]">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label htmlFor="email" className="mb-2 block text-base font-medium leading-6">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onChange={(event) => updateField('email', event.target.value)}
              className={`h-12 w-full rounded-lg border bg-transparent px-4 text-base text-[#191d23] outline-none transition focus:ring-2 focus:ring-[#299d91]/20 disabled:cursor-not-allowed disabled:opacity-60 ${fieldErrors.email ? 'border-[#e73d1c]' : 'border-[#4b5768] focus:border-[#299d91]'}`}
            />
            {fieldErrors.email && <p id="email-error" className="mt-1 text-sm text-[#e73d1c]">{fieldErrors.email}</p>}
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="text-base font-medium leading-6">Password</label>
              <button type="button" disabled className="text-xs font-medium text-[#299d91] disabled:cursor-not-allowed">Forgot Password?</button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                onChange={(event) => updateField('password', event.target.value)}
                className={`h-12 w-full rounded-lg border bg-transparent px-4 pr-12 text-base text-[#191d23] outline-none transition focus:ring-2 focus:ring-[#299d91]/20 disabled:cursor-not-allowed disabled:opacity-60 ${fieldErrors.password ? 'border-[#e73d1c]' : 'border-[#d0d5dd] focus:border-[#299d91]'}`}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#999da3] hover:text-[#299d91] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#299d91] disabled:cursor-not-allowed"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                  {passwordVisible && <path d="m4 4 16 16" />}
                </svg>
              </button>
            </div>
            {fieldErrors.password && <p id="password-error" className="mt-1 text-sm text-[#e73d1c]">{fieldErrors.password}</p>}
          </div>

          <label className="mb-4 flex w-fit items-center gap-4 text-base font-light leading-6">
            <input
              type="checkbox"
              checked={keepSignedIn}
              disabled={isLoading}
              onChange={(event) => setKeepSignedIn(event.target.checked)}
              className="h-5 w-5 accent-[#299d91]"
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded bg-[#299d91] px-3 text-base font-semibold text-white transition hover:bg-[#238b80] focus:outline-none focus:ring-2 focus:ring-[#299d91] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Signing in…' : 'Login'}
          </button>

          <div className="my-6 flex items-center gap-4 text-sm text-[#999da3]">
            <span className="h-px flex-1 bg-[#d0d5dd]" />
            <span>or sign in with</span>
            <span className="h-px flex-1 bg-[#d0d5dd]" />
          </div>

          <button type="button" disabled className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-4 rounded bg-[#e4e7eb] text-base text-[#4b5768]">
            <span aria-hidden="true" className="text-xl font-semibold text-[#4285f4]">G</span>
            Continue with Google
          </button>

          <div className="mt-10 text-center">
            <Link
              to="/register"
              aria-disabled={isLoading}
              onClick={(event) => { if (isLoading) event.preventDefault() }}
              className={`text-base font-semibold text-[#299d91] ${isLoading ? 'pointer-events-none opacity-60' : 'hover:underline'}`}
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Login
