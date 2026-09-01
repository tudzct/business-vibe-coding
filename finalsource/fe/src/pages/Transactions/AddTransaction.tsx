import axios from 'axios'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import { categoryService } from '../../api/category.service'
import { transactionService } from '../../api/transaction.service'
import {
  AccountListItem,
  Category,
  CreateTransactionPayload,
} from '../../api/types'
import { useAuth } from '../../context/AuthContext'

interface ErrorEnvelope {
  message?: string | string[]
}

interface FormValues {
  type: 'Revenue' | 'Expense'
  accountId: string
  amount: string
  transactionDate: string
  itemDescription: string
  shopName: string
  paymentMethod: string
  categoryId: string
}

type FieldErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  type: 'Expense',
  accountId: '',
  amount: '',
  transactionDate: '',
  itemDescription: '',
  shopName: '',
  paymentMethod: '',
  categoryId: '',
}

const navigation = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'Balances', path: '/account' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Bills', path: '/bills' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Goals', path: '/goals' },
]

function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ErrorEnvelope>(error)) return fallback
  if (error.code === 'ERR_CANCELED') return ''
  const message = error.response?.data?.message
  if (Array.isArray(message)) return message.join(' ')
  return typeof message === 'string' && message.trim() ? message : fallback
}

const NavIcon = ({ active = false }: { active?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.7">
    {active ? (
      <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    )}
  </svg>
)

const AddTransaction = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [accounts, setAccounts] = useState<AccountListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [accountError, setAccountError] = useState('')
  const [categoryWarning, setCategoryWarning] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadAccounts = async () => {
      try {
        const response = await accountService.getAccountOptions(controller.signal)
        const options = response.data?.accounts ?? []
        setAccounts(options)
        if (options.length === 0) setAccountError('No eligible account is available for transactions.')
      } catch (error: unknown) {
        const message = apiErrorMessage(error, 'Unable to load accounts. Please try again.')
        if (message) setAccountError(message)
      } finally {
        if (!controller.signal.aborted) setAccountsLoading(false)
      }
    }

    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories(controller.signal)
        setCategories(response.data ?? [])
      } catch (error: unknown) {
        const message = apiErrorMessage(
          error,
          'Categories are unavailable. You can continue without a category.',
        )
        if (message) setCategoryWarning(message)
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false)
      }
    }

    void loadAccounts()
    void loadCategories()
    return () => controller.abort()
  }, [])

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === Number(values.accountId)),
    [accounts, values.accountId],
  )

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  const validate = (): { errors: FieldErrors; payload?: CreateTransactionPayload } => {
    const errors: FieldErrors = {}
    const accountId = Number(values.accountId)
    const amount = Number(values.amount)
    const itemDescription = values.itemDescription.trim()
    const shopName = values.shopName.trim()
    const paymentMethod = values.paymentMethod.trim()

    if (!Number.isInteger(accountId) || !selectedAccount) errors.accountId = 'Select an available account.'
    if (values.type !== 'Revenue' && values.type !== 'Expense') errors.type = 'Select a valid transaction type.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.transactionDate) || Number.isNaN(Date.parse(`${values.transactionDate}T00:00:00Z`))) {
      errors.transactionDate = 'Enter a valid date.'
    }
    if (!itemDescription) errors.itemDescription = 'Item description is required.'
    if (!shopName) errors.shopName = 'Shop or recipient name is required.'
    if (!paymentMethod) errors.paymentMethod = 'Payment method is required.'
    if (!Number.isFinite(amount) || amount < 0.01) errors.amount = 'Amount must be at least 0.01.'
    if (values.type === 'Expense' && selectedAccount && amount > selectedAccount.balance) {
      errors.amount = 'Expense amount exceeds the selected account balance.'
    }

    let categoryId: number | undefined
    if (values.categoryId) {
      categoryId = Number(values.categoryId)
      if (!Number.isInteger(categoryId) || !categories.some((category) => category.category_id === categoryId)) {
        errors.categoryId = 'Select an available category or leave it blank.'
      }
    }

    if (Object.keys(errors).length > 0) return { errors }
    return {
      errors,
      payload: {
        accountId,
        transactionDate: values.transactionDate,
        type: values.type,
        itemDescription,
        ...(categoryId === undefined ? {} : { category_id: categoryId }),
        shopName,
        amount,
        paymentMethod,
      },
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting || accountsLoading || accounts.length === 0) return
    const result = validate()
    setFieldErrors(result.errors)
    if (!result.payload) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await transactionService.createTransaction(result.payload)
      if (!response.success || !response.data) {
        setSubmitError(response.message || 'Unable to create transaction. Please try again.')
        return
      }
      setValues(initialValues)
      navigate('/transactions', {
        replace: true,
        state: { successMessage: response.message || 'Transaction created successfully' },
      })
    } catch (error: unknown) {
      setSubmitError(apiErrorMessage(error, 'Unable to create transaction. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account'
  const accountDisabled = accountsLoading || accounts.length === 0

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans text-[#222] lg:flex">
      <aside className="hidden min-h-screen w-[280px] shrink-0 flex-col bg-[#191919] px-7 py-12 text-[#b7b7b7] lg:flex">
        <div className="px-7 text-[25px] font-bold tracking-[1.5px] text-white">FINEbank.IO</div>
        <nav aria-label="Primary" className="mt-12 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={() => `flex h-12 items-center gap-3 rounded px-4 text-base ${item.path === '/transactions' ? 'bg-[#299d91] font-semibold text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <NavIcon active={item.path === '/transactions'} />{item.label}
            </NavLink>
          ))}
          <button type="button" disabled className="flex h-12 w-full cursor-not-allowed items-center gap-3 rounded px-4 text-left opacity-70"><NavIcon />Settings</button>
        </nav>
        <div className="mt-auto">
          <button type="button" onClick={() => { logout(); navigate('/login') }} className="flex h-12 w-full items-center gap-3 rounded bg-white/[0.06] px-4 font-semibold hover:bg-white/10 hover:text-white"><NavIcon />Logout</button>
          <div className="mt-11 border-t border-white/10 pt-9">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030] text-xs text-white">{displayName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{displayName}</p><p className="text-xs">View profile</p></div>
              <span className="ml-auto text-xl text-white" aria-hidden="true">⋮</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[88px] items-center gap-5 border-b border-[#e7e8ea] px-5 sm:px-7">
          <div className="mr-auto flex items-center gap-3 text-sm text-[#9a9a9a]"><span className="text-2xl" aria-hidden="true">»</span><span>May 19, 2023</span></div>
          <button type="button" aria-label="Notifications" aria-disabled="true" className="relative text-[#686868]"><span aria-hidden="true" className="text-2xl">♟</span><span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#299d91]" /></button>
          <label className="relative hidden w-[352px] sm:block"><span className="sr-only">Search</span><input type="search" readOnly placeholder="Search here" className="h-12 w-full rounded-xl border-0 bg-white px-8 pr-14 text-base shadow-[0_18px_30px_rgba(0,0,0,0.04)] outline-none" /><span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl" aria-hidden="true">⌕</span></label>
        </header>

        <section className="px-5 pb-12 pt-4 sm:px-7 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="text-[24px] font-normal text-[#8a8a8a]">Recent Transaction</h1><div className="mt-5 flex gap-8 text-base font-semibold"><span className="border-b-2 border-[#299d91] px-2 pb-2 text-[#299d91]">All</span><span className="px-2 pb-2 text-[#55565a]">Revenue</span><span className="px-2 pb-2 text-[#55565a]">Expenses</span></div></div>
            <span className="rounded bg-[#2fa096] px-5 py-3 text-sm font-semibold text-white">+&nbsp; Add Transaction</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-4 min-h-[704px] rounded-2xl bg-white px-6 py-7 shadow-[0_12px_30px_rgba(31,36,41,0.1)] sm:px-8">
            <h2 className="text-2xl font-semibold">Add Transaction</h2>
            <p className="mt-4 text-sm text-[#6b6b6b]">Enter the transaction details below. Fields marked * are required.</p>
            {submitError && <div role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
            <div className="mt-5 grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Transaction Type *" error={fieldErrors.type}>
                <select value={values.type} onChange={(event) => setField('type', event.target.value as FormValues['type'])} className={controlClass(Boolean(fieldErrors.type))}><option value="Expense">Expense</option><option value="Revenue">Revenue</option></select>
              </Field>
              <Field label="Account *" error={fieldErrors.accountId || accountError}>
                <select disabled={accountDisabled} value={values.accountId} onChange={(event) => setField('accountId', event.target.value)} className={controlClass(Boolean(fieldErrors.accountId || accountError))}>
                  <option value="">{accountsLoading ? 'Loading accounts…' : 'Select account'}</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.bank_name} • {account.account_type} •••• {account.account_number_last_4} — {account.balance.toFixed(2)}</option>)}
                </select>
              </Field>
              <Field label="Amount *" error={fieldErrors.amount}>
                <input type="number" min="0.01" step="0.01" inputMode="decimal" value={values.amount} onChange={(event) => setField('amount', event.target.value)} placeholder="0.00" className={controlClass(Boolean(fieldErrors.amount))} />
              </Field>
              <Field label="Transaction Date *" error={fieldErrors.transactionDate}>
                <input type="date" value={values.transactionDate} onChange={(event) => setField('transactionDate', event.target.value)} className={controlClass(Boolean(fieldErrors.transactionDate))} />
              </Field>
              <Field label="Item Description *" error={fieldErrors.itemDescription}>
                <input value={values.itemDescription} onChange={(event) => setField('itemDescription', event.target.value)} placeholder="Enter transaction description" className={controlClass(Boolean(fieldErrors.itemDescription))} />
              </Field>
              <Field label="Shop Name *" error={fieldErrors.shopName}>
                <input value={values.shopName} onChange={(event) => setField('shopName', event.target.value)} placeholder="Enter shop or recipient name" className={controlClass(Boolean(fieldErrors.shopName))} />
              </Field>
              <Field label="Payment Method *" error={fieldErrors.paymentMethod}>
                <input value={values.paymentMethod} onChange={(event) => setField('paymentMethod', event.target.value)} placeholder="Enter payment method" className={controlClass(Boolean(fieldErrors.paymentMethod))} />
              </Field>
              <Field label="Category (Optional)" error={fieldErrors.categoryId} warning={categoryWarning}>
                <select disabled={categoriesLoading || Boolean(categoryWarning)} value={values.categoryId} onChange={(event) => setField('categoryId', event.target.value)} className={controlClass(Boolean(fieldErrors.categoryId))}>
                  <option value="">{categoriesLoading ? 'Loading categories…' : 'Select category'}</option>
                  {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button type="button" disabled={submitting} onClick={() => navigate('/transactions')} className="h-12 rounded border border-[#2fa096] bg-white px-6 text-sm font-semibold text-[#2fa096] disabled:opacity-60">Cancel</button>
              <button type="submit" disabled={submitting || accountDisabled} className="h-12 min-w-40 rounded bg-[#2fa096] px-6 text-sm font-semibold text-white hover:bg-[#23877d] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Saving…' : 'Save Transaction'}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

const controlClass = (invalid: boolean) =>
  `h-12 w-full rounded-md border bg-white px-4 text-sm outline-none transition focus:ring-2 focus:ring-[#2fa096]/25 ${invalid ? 'border-red-500' : 'border-[#d6d9db] focus:border-[#2fa096]'}`

const Field = ({ label, error, warning, children }: { label: string; error?: string; warning?: string; children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-[#333]">
    <span>{label}</span>
    <span className="mt-2 block font-normal">{children}</span>
    {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    {!error && warning && <span className="mt-1 block text-xs font-normal text-amber-700">{warning}</span>}
  </label>
)

export default AddTransaction
