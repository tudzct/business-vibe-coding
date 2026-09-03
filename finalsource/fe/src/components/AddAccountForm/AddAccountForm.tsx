import axios from 'axios'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import type { AccountType, CreateAccountRequest } from '../../api/types'

const accountTypes: readonly AccountType[] = [
  'Checking',
  'Credit Card',
  'Savings',
  'Investment',
  'Loan',
]

interface FormValues {
  bankName: string
  accountType: AccountType
  branchName: string
  accountNumber: string
  balance: string
}

type FieldName = keyof FormValues
type FieldErrors = Partial<Record<FieldName, string>>

const initialValues: FormValues = {
  bankName: '',
  accountType: 'Checking',
  branchName: '',
  accountNumber: '',
  balance: '',
}

const fieldClasses =
  'mt-2 h-[52px] w-full rounded-[3px] border border-[#e3e6e8] bg-white px-4 text-sm text-[#25272a] outline-none transition focus:border-[#2fa79d] focus:ring-2 focus:ring-[#2fa79d]/20 disabled:bg-gray-50'

const validate = (values: FormValues): FieldErrors => {
  const errors: FieldErrors = {}
  if (!values.bankName.trim()) errors.bankName = 'Bank name is required.'
  if (!accountTypes.includes(values.accountType)) errors.accountType = 'Select a valid account type.'
  if (!/^\d{8,34}$/.test(values.accountNumber)) {
    errors.accountNumber = 'Account number must contain 8–34 digits.'
  }
  if (!values.balance.trim()) {
    errors.balance = 'Current balance is required.'
  } else if (!Number.isFinite(Number(values.balance))) {
    errors.balance = 'Current balance must be a valid number.'
  }
  return errors
}

const mapValidationMessages = (messages: string[]): { fields: FieldErrors; form: string | null } => {
  const fields: FieldErrors = {}
  const remaining: string[] = []
  for (const message of messages) {
    const normalized = message.toLowerCase()
    if (normalized.includes('bank_name')) fields.bankName = message
    else if (normalized.includes('account_type')) fields.accountType = message
    else if (normalized.includes('branch_name')) fields.branchName = message
    else if (normalized.includes('account_number_full')) fields.accountNumber = message
    else if (normalized.includes('balance')) fields.balance = message
    else remaining.push(message)
  }
  return { fields, form: remaining.length > 0 ? remaining.join(' ') : null }
}

const AddAccountForm = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const mounted = useRef(true)

  useEffect(() => () => {
    mounted.current = false
    activeRequest.current?.abort()
    if (navigationTimer.current) clearTimeout(navigationTimer.current)
  }, [])

  const updateValue = <K extends FieldName>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const errors = validate(values)
    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length > 0) return

    const payload: CreateAccountRequest = {
      bank_name: values.bankName.trim(),
      account_type: values.accountType,
      account_number_full: values.accountNumber,
      balance: Number(values.balance),
      ...(values.branchName.trim() ? { branch_name: values.branchName.trim() } : {}),
    }

    const controller = new AbortController()
    activeRequest.current = controller
    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      const response = await accountService.createAccount(payload, controller.signal)
      if (
        !response.success ||
        typeof response.message !== 'string' ||
        !response.data?.account ||
        typeof response.data.account.id !== 'number'
      ) {
        throw new Error('Malformed create-account response')
      }
      if (!mounted.current) return
      setSuccessMessage('Account created successfully')
      navigationTimer.current = setTimeout(() => navigate('/accounts'), 1500)
    } catch (error: unknown) {
      if (!mounted.current || axios.isCancel(error)) return
      if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
        if (error.response?.status === 401) return
        const rawMessage = error.response?.data?.message
        const messages = Array.isArray(rawMessage)
          ? rawMessage.filter((item): item is string => typeof item === 'string')
          : typeof rawMessage === 'string'
            ? [rawMessage]
            : []
        if (error.response?.status === 400 && messages.length > 0) {
          const mapped = mapValidationMessages(messages)
          setFieldErrors(mapped.fields)
          setFormError(mapped.form)
        } else if ([403, 409, 500].includes(error.response?.status ?? 0) && messages.length > 0) {
          setFormError(messages.join(' '))
        } else {
          setFormError('We could not create the account. Please try again.')
        }
      } else {
        setFormError('We could not create the account. Please try again.')
      }
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null
      if (mounted.current) setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-[804px] rounded-[7px] bg-white px-6 py-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] sm:px-[38px]">
      <h2 className="text-lg font-medium text-[#25272a]">Account information</h2>

      {formError && <div role="alert" className="mt-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <label className="block text-[13px] font-medium text-[#25272a]">
          Bank name
          <input value={values.bankName} onChange={(event) => updateValue('bankName', event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.bankName)} aria-describedby={fieldErrors.bankName ? 'bank-name-error' : undefined} className={fieldClasses} autoComplete="organization" />
          {fieldErrors.bankName && <span id="bank-name-error" className="mt-1 block text-xs text-red-600">{fieldErrors.bankName}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Account type
          <select value={values.accountType} onChange={(event) => updateValue('accountType', event.target.value as AccountType)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.accountType)} className={fieldClasses}>
            {accountTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {fieldErrors.accountType && <span className="mt-1 block text-xs text-red-600">{fieldErrors.accountType}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Branch name <span className="font-normal text-[#8a8f98]">(optional)</span>
          <input value={values.branchName} onChange={(event) => updateValue('branchName', event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.branchName)} className={fieldClasses} autoComplete="off" />
          {fieldErrors.branchName && <span className="mt-1 block text-xs text-red-600">{fieldErrors.branchName}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Account number
          <input value={values.accountNumber} onChange={(event) => updateValue('accountNumber', event.target.value)} disabled={isSubmitting} inputMode="numeric" autoComplete="off" aria-invalid={Boolean(fieldErrors.accountNumber)} aria-describedby={fieldErrors.accountNumber ? 'account-number-error' : 'account-number-hint'} className={fieldClasses} />
          {fieldErrors.accountNumber && <span id="account-number-error" className="mt-1 block text-xs text-red-600">{fieldErrors.accountNumber}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a] md:col-span-2">
          Current balance
          <input value={values.balance} onChange={(event) => updateValue('balance', event.target.value)} disabled={isSubmitting} inputMode="decimal" autoComplete="off" aria-invalid={Boolean(fieldErrors.balance)} aria-describedby={fieldErrors.balance ? 'balance-error' : undefined} className={fieldClasses} />
          {fieldErrors.balance && <span id="balance-error" className="mt-1 block text-xs text-red-600">{fieldErrors.balance}</span>}
        </label>
      </div>

      <div id="account-number-hint" className="mt-6 flex gap-3 rounded bg-[#f7fafa] px-4 py-3 text-xs text-[#8a8f98]">
        <span aria-hidden="true" className="font-bold text-[#2fa79d]">i</span>
        <span>Account number must contain 8–34 digits. The last 4 digits are derived automatically.</span>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => navigate('/accounts')} disabled={isSubmitting} className="h-11 min-w-[118px] rounded-[3px] border border-[#e3e6e8] bg-white px-5 text-sm font-medium text-[#25272a] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/30 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-[3px] bg-[#2fa79d] px-5 text-sm font-medium text-white transition hover:bg-[#278f86] focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/40 disabled:cursor-not-allowed disabled:opacity-65">
          {isSubmitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isSubmitting ? 'Adding…' : 'Add Account'}
        </button>
      </div>

      {successMessage && <div role="status" className="fixed bottom-6 right-6 rounded bg-[#25272a] px-5 py-3 text-sm font-medium text-white shadow-lg">{successMessage}</div>}
    </form>
  )
}

export default AddAccountForm
