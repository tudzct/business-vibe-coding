import axios from 'axios'
import { FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import type { AccountType, CreateAccountPayload } from '../../api/types'

const accountTypes: AccountType[] = ['Checking', 'Credit Card', 'Savings', 'Investment', 'Loan']

interface FormValues {
  bank_name: string
  account_type: AccountType
  branch_name: string
  account_number_full: string
  balance: string
}

type FieldName = keyof FormValues
type FieldErrors = Partial<Record<FieldName, string>>

const initialValues: FormValues = {
  bank_name: '',
  account_type: 'Checking',
  branch_name: '',
  account_number_full: '',
  balance: '',
}

const fieldClass = (hasError: boolean) =>
  `mt-2 h-[52px] w-full rounded-[3px] border bg-white px-4 text-sm text-[#25272a] outline-none transition focus:ring-2 focus:ring-[#2fa79d]/20 ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-[#e3e6e8] focus:border-[#2fa79d]'
  }`

const messageText = (message: unknown): string | undefined => {
  if (typeof message === 'string') return message
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) return message.join(' ')
  return undefined
}

export interface AddAccountFormProps {
  onSuccess: (message: string) => void
}

export default function AddAccountForm({ onSuccess }: AddAccountFormProps) {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const requestInFlight = useRef(false)

  const updateField = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmissionError(null)
  }

  const validate = (): { errors: FieldErrors; balance?: number } => {
    const nextErrors: FieldErrors = {}
    const balance = Number(values.balance)

    if (!values.bank_name.trim()) nextErrors.bank_name = 'Bank name is required.'
    if (!accountTypes.includes(values.account_type)) nextErrors.account_type = 'Select a valid account type.'
    if (!/^[0-9]{8,34}$/.test(values.account_number_full)) {
      nextErrors.account_number_full = 'Account number must contain 8–34 digits.'
    }
    if (!values.balance.trim() || !Number.isFinite(balance) || balance < 0) {
      nextErrors.balance = 'Current balance must be a valid number of at least 0.'
    } else if (
      (values.account_type === 'Savings' || values.account_type === 'Investment') &&
      balance < 50000
    ) {
      nextErrors.balance = 'Savings and Investment accounts require at least 50,000.'
    }
    if (
      (values.account_type === 'Loan' || values.account_type === 'Investment') &&
      !values.branch_name.trim()
    ) {
      nextErrors.branch_name = `Branch name is required for ${values.account_type} accounts.`
    }

    return { errors: nextErrors, balance }
  }

  const mapApiError = (status: number | undefined, message: string | undefined) => {
    const safeMessage = message || 'We could not create the account. Please try again.'
    const normalized = safeMessage.toLowerCase()
    const nextErrors: FieldErrors = {}

    if (status === 400) {
      if (normalized.includes('bank_name') || normalized.includes('bank name')) nextErrors.bank_name = safeMessage
      if (normalized.includes('account_type') || normalized.includes('account type')) nextErrors.account_type = safeMessage
      if (normalized.includes('branch_name') || normalized.includes('branch name')) nextErrors.branch_name = safeMessage
      if (normalized.includes('account_number') || normalized.includes('account number')) nextErrors.account_number_full = safeMessage
      if (normalized.includes('balance')) nextErrors.balance = safeMessage
    }
    if (status === 409 && (normalized.includes('account') || normalized.includes('number'))) {
      nextErrors.account_number_full = safeMessage
    }

    if (Object.keys(nextErrors).length > 0) setErrors(nextErrors)
    else setSubmissionError(safeMessage)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (requestInFlight.current) return

    const validation = validate()
    setErrors(validation.errors)
    setSubmissionError(null)
    if (Object.keys(validation.errors).length > 0 || validation.balance === undefined) return

    const payload: CreateAccountPayload = {
      bank_name: values.bank_name,
      account_type: values.account_type,
      account_number_full: values.account_number_full,
      balance: validation.balance,
      ...(values.branch_name.trim() ? { branch_name: values.branch_name } : {}),
    }

    requestInFlight.current = true
    setIsSubmitting(true)
    try {
      const response = await accountService.createAccount(payload)
      if (!response.success || !response.data?.account) throw new Error('Malformed account-creation response')
      onSuccess(response.message || 'Account created successfully')
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
        if (error.response?.status !== 401) {
          mapApiError(error.response?.status, messageText(error.response?.data?.message))
        }
      } else {
        setSubmissionError('We could not create the account. Please try again.')
      }
      requestInFlight.current = false
      setIsSubmitting(false)
    }
  }

  const errorFor = (field: FieldName) => errors[field]

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-6">
      {submissionError && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submissionError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="text-[13px] font-medium text-[#25272a]">
          Bank name
          <input
            value={values.bank_name}
            onChange={(event) => updateField('bank_name', event.target.value)}
            className={fieldClass(Boolean(errorFor('bank_name')))}
            aria-invalid={Boolean(errorFor('bank_name'))}
            aria-describedby={errorFor('bank_name') ? 'bank-name-error' : undefined}
            autoComplete="organization"
          />
          {errorFor('bank_name') && <span id="bank-name-error" className="mt-1 block text-xs text-red-600">{errorFor('bank_name')}</span>}
        </label>

        <label className="text-[13px] font-medium text-[#25272a]">
          Account type
          <select
            value={values.account_type}
            onChange={(event) => updateField('account_type', event.target.value)}
            className={fieldClass(Boolean(errorFor('account_type')))}
            aria-invalid={Boolean(errorFor('account_type'))}
          >
            {accountTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {errorFor('account_type') && <span className="mt-1 block text-xs text-red-600">{errorFor('account_type')}</span>}
        </label>

        <label className="text-[13px] font-medium text-[#25272a]">
          Branch name{values.account_type === 'Loan' || values.account_type === 'Investment' ? ' *' : ' (optional)'}
          <input
            value={values.branch_name}
            onChange={(event) => updateField('branch_name', event.target.value)}
            className={fieldClass(Boolean(errorFor('branch_name')))}
            aria-invalid={Boolean(errorFor('branch_name'))}
            aria-describedby={errorFor('branch_name') ? 'branch-name-error' : undefined}
          />
          {errorFor('branch_name') && <span id="branch-name-error" className="mt-1 block text-xs text-red-600">{errorFor('branch_name')}</span>}
        </label>

        <label className="text-[13px] font-medium text-[#25272a]">
          Account number
          <input
            value={values.account_number_full}
            onChange={(event) => updateField('account_number_full', event.target.value)}
            className={fieldClass(Boolean(errorFor('account_number_full')))}
            aria-invalid={Boolean(errorFor('account_number_full'))}
            aria-describedby={errorFor('account_number_full') ? 'account-number-error account-number-hint' : 'account-number-hint'}
            inputMode="numeric"
            autoComplete="off"
          />
          {errorFor('account_number_full') && <span id="account-number-error" className="mt-1 block text-xs text-red-600">{errorFor('account_number_full')}</span>}
        </label>
      </div>

      <label className="text-[13px] font-medium text-[#25272a]">
        Current balance
        <input
          value={values.balance}
          onChange={(event) => updateField('balance', event.target.value)}
          className={fieldClass(Boolean(errorFor('balance')))}
          aria-invalid={Boolean(errorFor('balance'))}
          aria-describedby={errorFor('balance') ? 'balance-error' : undefined}
          inputMode="decimal"
        />
        {errorFor('balance') && <span id="balance-error" className="mt-1 block text-xs text-red-600">{errorFor('balance')}</span>}
      </label>

      <div id="account-number-hint" className="flex items-start gap-2.5 rounded bg-[#f7fafa] px-3.5 py-3 text-xs text-[#8a8f98]">
        <span aria-hidden="true" className="font-bold text-[#2fa79d]">i</span>
        <span>Account number must contain 8–34 digits. The last 4 digits are derived automatically.</span>
      </div>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/accounts')}
          disabled={isSubmitting}
          className="h-11 rounded-[3px] border border-[#e3e6e8] bg-white px-8 text-sm font-medium text-[#25272a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-[3px] bg-[#2fa79d] px-8 text-sm font-medium text-white transition hover:bg-[#278f87] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Adding Account…' : 'Add Account'}
        </button>
      </div>
    </form>
  )
}
