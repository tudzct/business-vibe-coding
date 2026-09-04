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
      navigate('/dashboard')
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
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setPasswordVisible((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {fieldErrors.password && <p id="password-error" className="mt-1 text-sm text-[#e73d1c]">{fieldErrors.password}</p>}
          </div>

          <div className="mb-8 flex items-center">
            <input
              id="keepSignedIn"
              name="keepSignedIn"
              type="checkbox"
              checked={keepSignedIn}
              onChange={(event) => setKeepSignedIn(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#299d91] focus:ring-[#299d91]"
            />
            <label htmlFor="keepSignedIn" className="ml-2 block text-sm text-gray-900">
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#299d91] px-4 text-base font-semibold text-white transition hover:bg-[#23877d] focus:outline-none focus:ring-2 focus:ring-[#299d91]/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#4b5768]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#299d91] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login
