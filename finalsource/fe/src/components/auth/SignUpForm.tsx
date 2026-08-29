import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface FormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type FieldName = keyof FormValues
type FieldErrors = Partial<Record<FieldName, string>>

const initialValues: FormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SignUpForm = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const updateField = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {}

    if (!values.fullName.trim()) nextErrors.fullName = 'Full name is required'
    if (!values.email.trim()) {
      nextErrors.email = 'Email address is required'
    } else if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (!values.password) nextErrors.password = 'Password is required'
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Password confirmation is required'
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await register(values)
      navigate('/')
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-5 py-12 text-[#1f2025] sm:py-20">
      <section className="mx-auto w-full max-w-[400px]" aria-labelledby="signup-title">
        <div className="mb-7 text-center text-[40px] font-semibold leading-none tracking-[0.02em] text-[#2aa198]">
          <span className="font-extrabold">FINE</span>bank.IO
        </div>
        <h1 id="signup-title" className="mb-9 text-center text-[25px] font-bold">
          Create an account
        </h1>

        {formError && (
          <div role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="fullName"
            label="Name"
            value={values.fullName}
            error={errors.fullName}
            autoComplete="name"
            placeholder="Tanzir Rahman"
            onChange={(value) => updateField('fullName', value)}
          />
          <TextField
            id="email"
            label="Email Address"
            type="email"
            value={values.email}
            error={errors.email}
            autoComplete="email"
            placeholder="hello@example.com"
            onChange={(value) => updateField('email', value)}
          />
          <PasswordField
            id="password"
            label="Password"
            value={values.password}
            error={errors.password}
            visible={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
            onChange={(value) => updateField('password', value)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            visible={showConfirmation}
            onToggle={() => setShowConfirmation((current) => !current)}
            onChange={(value) => updateField('confirmPassword', value)}
          />

          <p className="mb-5 mt-1 text-sm text-[#7b8494]">
            By continuing, you agree to our <span className="text-[#239b91]">terms of service.</span>
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded bg-[#2ca398] text-base font-semibold text-white transition hover:bg-[#258f86] focus:outline-none focus:ring-2 focus:ring-[#2ca398] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing up…' : 'Sign up'}
          </button>

          <div className="my-8 flex items-center gap-4 text-sm text-[#9ba1ab]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#d9dde3]" />
            <span>or sign up with</span>
            <span className="h-px flex-1 bg-[#d9dde3]" />
          </div>

          <button
            type="button"
            className="flex h-12 w-full cursor-default items-center justify-center gap-4 rounded bg-[#e4e7eb] text-base text-[#526078]"
            aria-disabled="true"
          >
            <span className="font-bold text-[#4285f4]" aria-hidden="true">G</span>
            Continue with Google
          </button>

          <p className="mt-10 text-center text-base text-[#9ba1ab]">
            Already have an account? <span className="font-semibold text-[#239b91]">Sign in here</span>
          </p>
        </form>
      </section>
    </main>
  )
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  error?: string
  type?: 'text' | 'email'
  autoComplete: string
  placeholder?: string
  onChange: (value: string) => void
}

const TextField = ({
  id,
  label,
  value,
  error,
  type = 'text',
  autoComplete,
  placeholder,
  onChange,
}: TextFieldProps) => (
  <div className="mb-6">
    <label htmlFor={id} className="mb-2 block text-base font-medium">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className="h-12 w-full rounded-lg border border-[#cbd1da] bg-transparent px-4 text-base outline-none transition placeholder:text-[#a7adb7] focus:border-[#526078] focus:ring-1 focus:ring-[#526078]"
    />
    {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  error?: string
  visible: boolean
  onToggle: () => void
  onChange: (value: string) => void
}

const PasswordField = ({ id, label, value, error, visible, onToggle, onChange }: PasswordFieldProps) => (
  <div className="mb-6">
    <label htmlFor={id} className="mb-2 block text-base font-medium">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete="new-password"
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 w-full rounded-lg border border-[#cbd1da] bg-transparent px-4 pr-12 text-base outline-none transition focus:border-[#526078] focus:ring-1 focus:ring-[#526078]"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2ca398]"
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">{visible ? '◉' : '◌'}</span>
      </button>
    </div>
    {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

export default SignUpForm

