import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword'
type FieldErrors = Partial<Record<FieldName, string>>

interface ApiErrorResponse {
  message: string | string[]
}

interface PasswordFieldProps {
  id: 'password' | 'confirmPassword'
  label: string
  value: string
  error?: string
  disabled: boolean
  onChange: (name: FieldName, value: string) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const fullNamePattern = /^\p{L}+(?: \p{L}+)*$/u
const permittedPasswordPattern = /^[A-Za-z0-9!@#$%^&*(){}_+=[\],./<>?\\|:;-]+$/
const specialCharacterPattern = /[!@#$%^&*(){}_+=[\],./<>?\\|:;-]/

const PasswordField = ({ id, label, value, error, disabled, onChange }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-medium text-[#1b1d24]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          disabled={disabled}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(id, event.target.value)}
          className={`h-12 w-full rounded-lg border bg-transparent px-4 pr-12 text-[#1b1d24] outline-none transition focus:ring-2 focus:ring-[#2ca395]/25 disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? 'border-red-500' : 'border-[#aeb6c4] focus:border-[#2ca395]'
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9aa2af] transition hover:text-[#2ca395] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2ca395] disabled:cursor-not-allowed"
        >
          {visible ? (
            <span aria-hidden="true" className="text-xs font-semibold">Hide</span>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>
      {error && <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState<Record<FieldName, string>>({
    fullName: '', email: '', password: '', confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (name: FieldName, value: string) => {
    setFormData((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {}
    const normalizedFullName = formData.fullName.trim().normalize('NFC')
    if (!normalizedFullName) errors.fullName = 'Name is required.'
    else if (normalizedFullName.length < 4 || normalizedFullName.length > 25) {
      errors.fullName = 'Name must be between 4 and 25 characters.'
    } else if (!fullNamePattern.test(normalizedFullName)) {
      errors.fullName = 'Use letters with single spaces between words.'
    }
    if (!formData.email.trim()) errors.email = 'Email address is required.'
    else if (formData.email.trim().length > 255) errors.email = 'Email address must be at most 255 characters.'
    else if (!emailPattern.test(formData.email.trim())) errors.email = 'Enter a valid email address.'
    if (!formData.password) errors.password = 'Password is required.'
    else if (formData.password.length < 8 || formData.password.length > 64) {
      errors.password = 'Password must be between 8 and 64 characters.'
    } else if (/\s/.test(formData.password)) {
      errors.password = 'Password must not contain whitespace.'
    } else if (!permittedPasswordPattern.test(formData.password)) {
      errors.password = 'Password contains a character that is not permitted.'
    } else if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !specialCharacterPattern.test(formData.password)
    ) {
      errors.password = 'Password must include lowercase, uppercase, digit, and special characters.'
    }
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required.'
    else if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match.'
    return errors
  }

  const handleRegistrationError = (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error) || !error.response) {
      setFormError('Unable to register right now. Please check your connection and try again.')
      return
    }

    const rawMessage = error.response.data?.message
    const messages = Array.isArray(rawMessage)
      ? rawMessage
      : [rawMessage || 'Registration could not be completed.']

    if (error.response.status === 409) {
      setFieldErrors({ email: messages.join(' ') })
      return
    }
    if (error.response.status === 400) {
      const mapped: FieldErrors = {}
      const unmapped: string[] = []
      messages.forEach((message) => {
        const normalized = message.toLowerCase()
        if (normalized.includes('fullname') || normalized.includes('full name')) mapped.fullName = message
        else if (normalized.includes('email')) mapped.email = message
        else if (normalized.includes('confirmpassword') || normalized.includes('match')) mapped.confirmPassword = message
        else if (normalized.includes('password')) mapped.password = message
        else unmapped.push(message)
      })
      setFieldErrors(mapped)
      if (unmapped.length > 0) setFormError(unmapped.join(' '))
      return
    }
    setFormError(messages.join(' '))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return
    setFormError('')
    setFieldErrors({})
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      await register({
        fullName: formData.fullName.trim().normalize('NFC'),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
      navigate('/')
    } catch (error: unknown) {
      handleRegistrationError(error)
      setFormData((current) => ({ ...current, password: '', confirmPassword: '' }))
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-lg border bg-transparent px-4 text-[#1b1d24] outline-none transition placeholder:text-[#a0a6b0] focus:ring-2 focus:ring-[#2ca395]/25 disabled:cursor-not-allowed disabled:opacity-60 ${
      hasError ? 'border-red-500' : 'border-[#aeb6c4] focus:border-[#2ca395]'
    }`

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 py-12 text-[#1b1d24] sm:pb-20 sm:pt-[112px]">
      <section className="mx-auto w-full max-w-[400px]" aria-labelledby="registration-heading">
        <Link to="/" className="block text-center text-[40px] font-bold leading-none tracking-wide text-[#2ca395]">
          <span className="tracking-[0.04em]">FINE</span><span className="font-medium">bank.IO</span>
        </Link>
        <h1 id="registration-heading" className="mt-8 text-center text-[26px] font-bold">Create an account</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-6">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-base font-medium">Name</label>
            <input id="fullName" name="fullName" type="text" value={formData.fullName} disabled={isLoading}
              autoComplete="name" placeholder="Tanzir Rahman" aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
              onChange={(event) => updateField('fullName', event.target.value)} className={inputClass(Boolean(fieldErrors.fullName))} />
            {fieldErrors.fullName && <p id="fullName-error" className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-base font-medium">Email Address</label>
            <input id="email" name="email" type="email" value={formData.email} disabled={isLoading}
              autoComplete="email" placeholder="hello@example.com" aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onChange={(event) => updateField('email', event.target.value)} className={inputClass(Boolean(fieldErrors.email))} />
            {fieldErrors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>

          <PasswordField id="password" label="Password" value={formData.password} error={fieldErrors.password} disabled={isLoading} onChange={updateField} />
          <PasswordField id="confirmPassword" label="Confirm Password" value={formData.confirmPassword} error={fieldErrors.confirmPassword} disabled={isLoading} onChange={updateField} />

          <p className="text-sm text-[#747d8d]">By continuing, you agree to our <span className="font-medium text-[#259e90]">terms of service.</span></p>
          {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

          <button type="submit" disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded bg-[#2ca395] font-semibold text-white transition hover:bg-[#23897e] focus:outline-none focus:ring-2 focus:ring-[#2ca395] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65">
            {isLoading ? 'Signing up…' : 'Sign up'}
          </button>

          <div className="flex items-center gap-4 text-sm text-[#9ca3af]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#d8dce2]" /><span>or sign up with</span><span className="h-px flex-1 bg-[#d8dce2]" />
          </div>
          <button type="button" disabled aria-disabled="true" title="Google sign-up is unavailable"
            className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-4 rounded bg-[#e3e6eb] text-[#536179] opacity-75">
            <span aria-hidden="true" className="text-lg font-bold text-[#4285f4]">G</span>
            Continue with Google
          </button>
        </form>

        <p className="mt-10 text-center text-base text-[#9ca3af]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#259e90] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2ca395]">Sign in here</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
