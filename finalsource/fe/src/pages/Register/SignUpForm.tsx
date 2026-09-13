import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { authService, type RegisterRequest } from '../../api/auth.service'
import { useAuth } from '../../context/AuthContext'

type Field = keyof RegisterRequest
type FieldErrors = Partial<Record<Field, string>>

const namePattern = /^\p{L}+(?: \p{L}+)*$/u
const allowedPassword = /^[A-Za-z0-9!@#$%^&*(){}_=+[\],./<>?\\|:;-]+$/
const specialCharacter = /[!@#$%^&*(){}\-_+=[\],./<>?\\|:;]/

function validate(values: RegisterRequest): FieldErrors {
  const errors: FieldErrors = {}
  const fullName = values.fullName.normalize('NFC').trim()
  const email = values.email.trim().toLowerCase()
  const nameLength = Array.from(fullName).length
  if (nameLength < 4 || nameLength > 25 || !namePattern.test(fullName)) {
    errors.fullName = 'Enter a name of 4–25 letters, separated by single spaces.'
  }
  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  const password = values.password
  if (password.length < 8 || password.length > 64 || /\s/.test(password) ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) ||
      !specialCharacter.test(password) || !allowedPassword.test(password)) {
    errors.password = 'Use 8–64 permitted characters with upper- and lowercase letters, a number, and a symbol.'
  }
  if (values.confirmPassword !== password || !values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

function apiMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const response = error.response?.data as { message?: unknown } | undefined
    const message = response?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.every((part) => typeof part === 'string')) return message.join(' ')
  }
  return 'Registration failed. Please try again.'
}

export default function SignUpForm() {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const inFlight = useRef(false)
  const [form, setForm] = useState<RegisterRequest>({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [requestError, setRequestError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const update = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setRequestError('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inFlight.current) return
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setRequestError('')
    if (Object.keys(nextErrors).length) return

    inFlight.current = true
    setLoading(true)
    try {
      const response = await authService.register({
        ...form,
        fullName: form.fullName.normalize('NFC').trim(),
        email: form.email.trim().toLowerCase(),
      })
      if (!response.success || !response.data?.accessToken || !response.data.user) {
        setRequestError(response.message || 'Registration failed. Please try again.')
        return
      }
      establishSession(response.data.user, response.data.accessToken)
      navigate('/')
    } catch (error: unknown) {
      setRequestError(apiMessage(error))
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }

  const inputClass = (field: Field) => `mt-2 block w-full rounded-lg border bg-transparent px-4 py-3 text-base text-slate-800 outline-none transition focus:ring-2 focus:ring-teal-500 ${errors[field] ? 'border-red-500' : 'border-slate-300'}`

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 pb-16 pt-16 text-slate-800 sm:pt-24">
      <section className="mx-auto w-full max-w-[400px]" aria-labelledby="signup-title">
        <div className="mb-7 text-center text-[38px] font-bold tracking-[0.08em] text-[#29948d]">FINEbank.IO</div>
        <h1 id="signup-title" className="mb-9 text-center text-2xl font-bold">Create an account</h1>
        {requestError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{requestError}</p>}
        <form noValidate onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="register-name" className="block text-base font-medium">Name</label>
            <input id="register-name" autoComplete="name" className={inputClass('fullName')} value={form.fullName} onChange={update('fullName')} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'register-name-error' : undefined} />
            {errors.fullName && <p id="register-name-error" className="mt-1 text-sm text-red-700">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="register-email" className="block text-base font-medium">Email Address</label>
            <input id="register-email" type="email" autoComplete="email" className={inputClass('email')} value={form.email} onChange={update('email')} placeholder="hello@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
            {errors.email && <p id="register-email-error" className="mt-1 text-sm text-red-700">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="register-password" className="block text-base font-medium">Password</label>
            <div className="relative">
              <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className={`${inputClass('password')} pr-14`} value={form.password} onChange={update('password')} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />
              <button type="button" onClick={() => setShowPassword((shown) => !shown)} className="absolute inset-y-0 right-3 mt-2 px-2 text-sm text-slate-500 hover:text-[#29948d]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <p id="register-password-error" className="mt-1 text-sm text-red-700">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="register-confirm" className="block text-base font-medium">Confirm password</label>
            <input id="register-confirm" type="password" autoComplete="new-password" className={inputClass('confirmPassword')} value={form.confirmPassword} onChange={update('confirmPassword')} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined} />
            {errors.confirmPassword && <p id="register-confirm-error" className="mt-1 text-sm text-red-700">{errors.confirmPassword}</p>}
          </div>
          <p className="text-sm text-slate-500">By continuing, you agree to our <span className="text-[#29948d]">terms of service.</span></p>
          <button type="submit" disabled={loading} className="w-full rounded bg-[#29948d] px-4 py-3 font-semibold text-white transition hover:bg-[#217d77] focus:outline-none focus:ring-2 focus:ring-[#29948d] focus:ring-offset-2 disabled:opacity-60">{loading ? 'Signing up…' : 'Sign up'}</button>
        </form>
        <div className="my-8 flex items-center gap-4 text-sm text-slate-400"><span className="h-px flex-1 bg-slate-300" /><span>or sign up with</span><span className="h-px flex-1 bg-slate-300" /></div>
        <button type="button" disabled className="flex w-full items-center justify-center gap-3 rounded bg-slate-200 px-4 py-3 text-slate-600" title="Google sign-up is outside this registration flow"><span className="font-bold text-[#4285f4]">G</span>Continue with Google</button>
        <p className="mt-9 text-center text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-[#29948d] hover:underline">Sign in here</Link></p>
      </section>
    </main>
  )
}
