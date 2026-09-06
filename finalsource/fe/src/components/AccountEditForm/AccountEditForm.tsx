import axios from 'axios'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { accountService } from '../../api/account.service'
import type {
  AccountDetail,
  AccountType,
  UpdatedAccount,
  UpdateAccountRequest,
} from '../../api/types'

const accountTypes: readonly AccountType[] = [
  'Checking',
  'Credit Card',
  'Savings',
  'Investment',
  'Loan',
]

interface AccountEditFormProps {
  readonly account: AccountDetail
  readonly onCancel: () => void
  readonly onSuccess: (account: UpdatedAccount) => void | Promise<void>
}

interface FormValues {
  bankName: string
  accountType: AccountType
  branchName: string
  accountNumber: string
  balance: string
}

type FieldName = keyof FormValues
type FieldErrors = Partial<Record<FieldName, string>>

const valuesFromAccount = (account: AccountDetail): FormValues => ({
  bankName: account.bank_name,
  accountType: account.account_type,
  branchName: account.branch_name ?? '',
  accountNumber: account.account_number_full,
  balance: String(account.balance),
})

const fieldClasses =
  'mt-2 h-[52px] w-full rounded-[3px] border border-[#e3e6e8] bg-white px-4 text-sm text-[#25272a] outline-none transition focus:border-[#2fa79d] focus:ring-2 focus:ring-[#2fa79d]/20 disabled:bg-gray-50'

const validate = (accountId: number, values: FormValues): FieldErrors => {
  const errors: FieldErrors = {}
  if (!Number.isInteger(accountId) || accountId <= 0) errors.bankName = 'A valid account is required.'
  if (!values.bankName.trim()) errors.bankName = 'Bank name is required.'
  if (!accountTypes.includes(values.accountType)) errors.accountType = 'Select a valid account type.'
  if (!/^\d{8,34}$/.test(values.accountNumber.trim())) {
    errors.accountNumber = 'Account number must contain 8–34 digits.'
  }
  if (!values.balance.trim()) {
    errors.balance = 'Current balance is required.'
  } else if (!Number.isFinite(Number(values.balance))) {
    errors.balance = 'Current balance must be a valid number.'
  } else if (Number(values.balance) < 0) {
    errors.balance = 'Current balance must be zero or greater.'
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

const AccountEditForm = ({ account, onCancel, onSuccess }: AccountEditFormProps) => {
  const [values, setValues] = useState(() => valuesFromAccount(account))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStaleAccount, setIsStaleAccount] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    const nextValues = valuesFromAccount(account)
    activeRequest.current?.abort()
    if (successTimer.current) clearTimeout(successTimer.current)
    setValues(nextValues)
    setFieldErrors({})
    setFormError(null)
    setSuccessMessage(null)
    setIsStaleAccount(false)
    setIsSubmitting(false)
  }, [account])

  useEffect(() => () => {
    mounted.current = false
    activeRequest.current?.abort()
    if (successTimer.current) clearTimeout(successTimer.current)
  }, [])

  const updateValue = <K extends FieldName>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || isStaleAccount) return

    const errors = validate(account.id, values)
    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length > 0) return

    const payload: UpdateAccountRequest = {
      bank_name: values.bankName.trim(),
      account_type: values.accountType,
      branch_name: values.branchName.trim() || null,
      account_number_full: values.accountNumber.trim(),
      balance: Number(values.balance),
    }
    const controller = new AbortController()
    activeRequest.current = controller
    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      const response = await accountService.updateAccount(account.id, payload, controller.signal)
      if (
        !response.success ||
        response.message !== 'Account updated successfully' ||
        !response.data?.account ||
        response.data.account.account_id !== account.id
      ) {
        throw new Error('Malformed update-account response')
      }
      if (!mounted.current || activeRequest.current !== controller) return
      setSuccessMessage('Update successful')
      const updatedAccount = response.data.account
      successTimer.current = setTimeout(() => {
        if (mounted.current) void onSuccess(updatedAccount)
      }, 1500)
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
        } else if (error.response?.status === 403) {
          setFormError('You do not have permission to edit this account information.')
        } else if (error.response?.status === 404) {
          setFormError('This account could not be found.')
          setIsStaleAccount(true)
        } else if (error.response?.status === 500) {
          setFormError('An error occurred while saving the data. Please try again later.')
        } else if (error.response?.status === 409 && messages.length > 0) {
          setFormError(messages.join(' '))
        } else {
          setFormError('We could not save this account. Please try again.')
        }
      } else {
        setFormError('We could not save this account. Please try again.')
      }
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null
      if (mounted.current) setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-[804px] rounded-[7px] bg-white px-6 py-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] sm:px-[38px]">
      <h2 className="text-lg font-medium text-[#25272a]">Edit account information</h2>
      <div aria-live="polite">
        {formError && <div role="alert" className="mt-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <label className="block text-[13px] font-medium text-[#25272a]">
          Bank name
          <input value={values.bankName} onChange={(event) => updateValue('bankName', event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.bankName)} aria-describedby={fieldErrors.bankName ? 'edit-bank-name-error' : undefined} className={fieldClasses} autoComplete="organization" />
          {fieldErrors.bankName && <span id="edit-bank-name-error" className="mt-1 block text-xs text-red-600">{fieldErrors.bankName}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Account type
          <select value={values.accountType} onChange={(event) => updateValue('accountType', event.target.value as AccountType)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.accountType)} aria-describedby={fieldErrors.accountType ? 'edit-account-type-error' : undefined} className={fieldClasses}>
            {accountTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {fieldErrors.accountType && <span id="edit-account-type-error" className="mt-1 block text-xs text-red-600">{fieldErrors.accountType}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Branch name <span className="font-normal text-[#8a8f98]">(optional)</span>
          <input value={values.branchName} onChange={(event) => updateValue('branchName', event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.branchName)} aria-describedby={fieldErrors.branchName ? 'edit-branch-name-error' : undefined} className={fieldClasses} autoComplete="off" />
          {fieldErrors.branchName && <span id="edit-branch-name-error" className="mt-1 block text-xs text-red-600">{fieldErrors.branchName}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a]">
          Account number
          <input value={values.accountNumber} onChange={(event) => updateValue('accountNumber', event.target.value)} disabled={isSubmitting} inputMode="numeric" autoComplete="off" aria-invalid={Boolean(fieldErrors.accountNumber)} aria-describedby={fieldErrors.accountNumber ? 'edit-account-number-error' : 'edit-account-number-hint'} className={fieldClasses} />
          {fieldErrors.accountNumber && <span id="edit-account-number-error" className="mt-1 block text-xs text-red-600">{fieldErrors.accountNumber}</span>}
        </label>

        <label className="block text-[13px] font-medium text-[#25272a] md:col-span-2">
          Current balance
          <input value={values.balance} onChange={(event) => updateValue('balance', event.target.value)} disabled={isSubmitting} inputMode="decimal" autoComplete="off" aria-invalid={Boolean(fieldErrors.balance)} aria-describedby={fieldErrors.balance ? 'edit-balance-error' : undefined} className={fieldClasses} />
          {fieldErrors.balance && <span id="edit-balance-error" className="mt-1 block text-xs text-red-600">{fieldErrors.balance}</span>}
        </label>
      </div>

      <div id="edit-account-number-hint" className="mt-6 flex gap-3 rounded bg-[#f7fafa] px-4 py-3 text-xs text-[#8a8f98]">
        <span aria-hidden="true" className="font-bold text-[#2fa79d]">i</span>
        <span>Account number must contain 8–34 digits and remain unique for this user; the last 4 digits are derived automatically.</span>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="h-11 min-w-[118px] rounded-[3px] border border-[#e3e6e8] bg-white px-5 text-sm font-medium text-[#25272a] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/30 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
        <button type="submit" disabled={isSubmitting || isStaleAccount} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-[3px] bg-[#2fa79d] px-5 text-sm font-medium text-white transition hover:bg-[#278f86] focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/40 disabled:cursor-not-allowed disabled:opacity-65">
          {isSubmitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {successMessage && <div role="status" className="fixed bottom-6 right-6 rounded bg-[#25272a] px-5 py-3 text-sm font-medium text-white shadow-lg">{successMessage}</div>}
    </form>
  )
}

export default AccountEditForm
