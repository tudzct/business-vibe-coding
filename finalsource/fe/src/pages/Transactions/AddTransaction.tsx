import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import { categoryService } from '../../api/category.service'
import { transactionService } from '../../api/transaction.service'
import type { Account, Category, CreateTransactionRequest } from '../../api/types'
import { useAuth } from '../../hooks/useAuth'

interface FormState {
  accountId: string
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  categoryId: string
  shopName: string
  amount: string
  paymentMethod: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialForm: FormState = {
  accountId: '',
  transactionDate: '',
  type: 'Expense',
  itemDescription: '',
  categoryId: '',
  shopName: '',
  amount: '',
  paymentMethod: '',
}

const readApiMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback
  const body: unknown = error.response?.data
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ')
    }
  }
  return fallback
}

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: '◇' },
  { label: 'Balances', path: '/account', icon: '▣' },
  { label: 'Transactions', path: '/transactions', icon: '⇄' },
  { label: 'Bills', path: '/bills', icon: '▤' },
  { label: 'Expenses', path: '/expenses', icon: '▧' },
  { label: 'Goals', path: '/goals', icon: '◉' },
] as const

const controlClass =
  'mt-2 h-12 w-full rounded-md border border-[#d6d9db] bg-white px-4 text-sm text-[#383838] outline-none transition focus:border-[#299D91] focus:ring-2 focus:ring-[#299D91]/20 disabled:cursor-not-allowed disabled:bg-gray-50'

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTransactionDateBounds = (): { min: string; max: string } => {
  const min = new Date()
  const max = new Date()
  min.setDate(min.getDate() - 365)
  max.setDate(max.getDate() + 1)
  return { min: formatDateInput(min), max: formatDateInput(max) }
}

const AddTransaction: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navigationTimer = useRef<number | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [categoryWarning, setCategoryWarning] = useState('')
  const [requestError, setRequestError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const transactionDateBounds = getTransactionDateBounds()

  useEffect(() => {
    const controller = new AbortController()

    const loadAccounts = async (): Promise<void> => {
      try {
        const response = await accountService.getAccounts(controller.signal)
        if (!response.success || !response.data) {
          setAccountError(response.message || 'Unable to load accounts.')
          return
        }
        setAccounts(response.data.accounts)
        if (response.data.accounts.length === 0) {
          setAccountError('No account is available for a transaction.')
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setAccountError(readApiMessage(error, 'Unable to load accounts. Please try again.'))
        }
      } finally {
        if (!controller.signal.aborted) setAccountsLoading(false)
      }
    }

    const loadCategories = async (): Promise<void> => {
      try {
        const response = await categoryService.getCategories(controller.signal)
        if (!response.success || !response.data) {
          setCategoryWarning(response.message || 'Categories are unavailable. You can continue without one.')
          return
        }
        setCategories(response.data)
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setCategoryWarning(
            readApiMessage(error, 'Categories are unavailable. You can continue without one.'),
          )
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false)
      }
    }

    void loadAccounts()
    void loadCategories()
    return () => {
      controller.abort()
      if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current)
    }
  }, [])

  const updateField = (field: keyof FormState, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    const accountId = Number(form.accountId)
    const amount = Number(form.amount)
    const categoryId = Number(form.categoryId)

    if (!Number.isInteger(accountId) || !accounts.some((account) => account.id === accountId)) {
      next.accountId = 'Select an available account.'
    }
    if (
      !form.transactionDate ||
      Number.isNaN(Date.parse(`${form.transactionDate}T00:00:00Z`)) ||
      form.transactionDate < transactionDateBounds.min ||
      form.transactionDate > transactionDateBounds.max
    ) {
      next.transactionDate = 'Enter a valid transaction date.'
    }
    if (form.type !== 'Revenue' && form.type !== 'Expense') {
      next.type = 'Select Revenue or Expense.'
    }
    if (!form.itemDescription.trim()) next.itemDescription = 'Item description is required.'
    if (!form.shopName.trim()) next.shopName = 'Shop name is required.'
    if (!form.paymentMethod.trim()) next.paymentMethod = 'Payment method is required.'
    if (!form.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
      next.amount = 'Enter a positive amount.'
    } else if (form.paymentMethod.trim() === 'Cash' && amount > 50_000_000) {
      next.amount = 'Cash transactions cannot exceed 50,000,000.'
    }
    if (
      form.categoryId &&
      (!Number.isInteger(categoryId) || !categories.some((category) => category.category_id === categoryId))
    ) {
      next.categoryId = 'Select an available category.'
    }
    return next
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstField = Object.keys(nextErrors)[0]
      document.getElementById(firstField)?.focus()
      return
    }

    const payload: CreateTransactionRequest = {
      accountId: Number(form.accountId),
      transactionDate: form.transactionDate,
      type: form.type,
      itemDescription: form.itemDescription.trim(),
      shopName: form.shopName.trim(),
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod.trim(),
      ...(form.categoryId ? { category_id: Number(form.categoryId) } : {}),
    }

    setSubmitting(true)
    setRequestError('')
    setSuccessMessage('')
    try {
      const response = await transactionService.createTransaction(payload)
      if (!response.success || !response.data) {
        setRequestError(response.message || 'Unable to create transaction.')
        return
      }
      setSuccessMessage(response.message)
      setForm(initialForm)
      setErrors({})
      navigationTimer.current = window.setTimeout(() => navigate('/transactions'), 800)
    } catch (error: unknown) {
      setRequestError(readApiMessage(error, 'Unable to create transaction. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account User'
  const topDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
  const saveDisabled = accountsLoading || accounts.length === 0 || submitting

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#252525] lg:flex">
      <aside className="flex bg-[#191919] text-[#bdbdbd] lg:min-h-screen lg:w-[280px] lg:flex-col">
        <div className="flex w-full items-center gap-5 overflow-x-auto px-5 py-4 lg:flex lg:flex-col lg:items-stretch lg:overflow-visible lg:px-7 lg:py-12">
          <div className="mr-4 shrink-0 text-2xl font-bold tracking-[0.06em] text-white lg:mb-8 lg:px-7">
            FINE<span className="font-medium">bank.IO</span>
          </div>
          <nav aria-label="Primary" className="flex gap-2 lg:block lg:space-y-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-4 rounded px-4 py-3 text-sm font-medium transition-colors lg:w-full ${
                    isActive ? 'bg-[#299D91] text-white' : 'hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span aria-hidden="true" className="w-5 text-center text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <button type="button" disabled className="flex min-w-max cursor-default items-center gap-4 rounded px-4 py-3 text-sm font-medium lg:w-full">
              <span aria-hidden="true" className="w-5 text-center text-xl">⚙</span>
              Settings
            </button>
          </nav>
          <div className="hidden lg:mt-auto lg:block lg:pt-32">
            <button
              type="button"
              onClick={() => { logout(); navigate('/login') }}
              className="flex w-full items-center gap-4 rounded bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              <span aria-hidden="true" className="text-xl">↪</span> Logout
            </button>
            <div className="mt-11 border-t border-white/10 pt-8">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs">View profile</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[88px] items-center justify-between border-b border-black/5 px-6 lg:px-7">
          <div className="flex items-center gap-2 text-sm text-[#9d9d9d]"><span aria-hidden="true" className="text-2xl">»</span>{topDate}</div>
          <div className="flex items-center gap-7">
            <button type="button" disabled aria-label="Notifications" className="relative cursor-default text-xl text-[#555]">●<span className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-[#299D91]" /></button>
            <label className="hidden h-12 w-[352px] items-center rounded-xl bg-white px-8 shadow-[0_12px_32px_rgba(0,0,0,0.05)] sm:flex">
              <span className="sr-only">Search</span><input readOnly placeholder="Search here" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><span aria-hidden="true" className="text-2xl">⌕</span>
            </label>
          </div>
        </header>

        <section className="px-6 pb-10 pt-5 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><h1 className="text-2xl font-normal text-[#8a8a8a]">Recent Transaction</h1><div className="mt-5 flex gap-9 text-sm font-semibold"><span className="border-b-2 border-[#299D91] px-2 pb-2 text-[#299D91]">All</span><span className="px-2 pb-2 text-[#555]">Revenue</span><span className="px-2 pb-2 text-[#555]">Expenses</span></div></div>
            <button type="button" disabled className="mb-1 rounded bg-[#299D91] px-5 py-3 text-sm font-semibold text-white">＋ Add Transaction</button>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} noValidate className="mt-5 min-h-[704px] rounded-2xl bg-white px-8 py-7 shadow-[0_14px_34px_rgba(0,0,0,0.10)]">
            <h2 className="text-2xl font-semibold">Add Transaction</h2>
            <p className="mt-4 text-sm text-[#6b6b6b]">Enter the transaction details below. Fields marked * are required.</p>
            <div aria-live="polite" className="mt-4 min-h-6 text-sm">
              {accountError && <p role="alert" className="text-red-700">{accountError}</p>}
              {categoryWarning && <p role="status" className="text-amber-700">{categoryWarning}</p>}
              {requestError && <p role="alert" className="text-red-700">{requestError}</p>}
              {successMessage && <p role="status" className="text-[#23877d]">{successMessage}</p>}
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-5 md:grid-cols-2">
              <label className="text-sm font-semibold">Transaction Type *
                <select id="type" value={form.type} onChange={(event) => updateField('type', event.target.value as FormState['type'])} className={controlClass} aria-invalid={Boolean(errors.type)}>
                  <option value="Expense">Expense</option><option value="Revenue">Revenue</option>
                </select>{errors.type && <span className="mt-1 block text-xs text-red-600">{errors.type}</span>}
              </label>
              <label className="text-sm font-semibold">Account *
                <select id="accountId" value={form.accountId} onChange={(event) => updateField('accountId', event.target.value)} disabled={accountsLoading || accounts.length === 0} className={controlClass} aria-invalid={Boolean(errors.accountId)}>
                  <option value="">{accountsLoading ? 'Loading accounts…' : 'Select account'}</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.bank_name} •••• {account.account_number_last_4}</option>)}
                </select>{errors.accountId && <span className="mt-1 block text-xs text-red-600">{errors.accountId}</span>}
              </label>
              <label className="text-sm font-semibold">Amount *
                <input id="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} placeholder="0.00" className={controlClass} aria-invalid={Boolean(errors.amount)} />{errors.amount && <span className="mt-1 block text-xs text-red-600">{errors.amount}</span>}
              </label>
              <label className="text-sm font-semibold">Transaction Date *
                <input id="transactionDate" type="date" min={transactionDateBounds.min} max={transactionDateBounds.max} value={form.transactionDate} onChange={(event) => updateField('transactionDate', event.target.value)} className={controlClass} aria-invalid={Boolean(errors.transactionDate)} />{errors.transactionDate && <span className="mt-1 block text-xs text-red-600">{errors.transactionDate}</span>}
              </label>
              <label className="text-sm font-semibold">Item Description *
                <input id="itemDescription" value={form.itemDescription} onChange={(event) => updateField('itemDescription', event.target.value)} placeholder="Enter transaction description" className={controlClass} aria-invalid={Boolean(errors.itemDescription)} />{errors.itemDescription && <span className="mt-1 block text-xs text-red-600">{errors.itemDescription}</span>}
              </label>
              <label className="text-sm font-semibold">Shop Name *
                <input id="shopName" value={form.shopName} onChange={(event) => updateField('shopName', event.target.value)} placeholder="Enter shop or recipient name" className={controlClass} aria-invalid={Boolean(errors.shopName)} />{errors.shopName && <span className="mt-1 block text-xs text-red-600">{errors.shopName}</span>}
              </label>
              <label className="text-sm font-semibold">Payment Method *
                <input id="paymentMethod" value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)} placeholder="Enter payment method" className={controlClass} aria-invalid={Boolean(errors.paymentMethod)} />{errors.paymentMethod && <span className="mt-1 block text-xs text-red-600">{errors.paymentMethod}</span>}
              </label>
              <label className="text-sm font-semibold">Category (Optional)
                <select id="categoryId" value={form.categoryId} onChange={(event) => updateField('categoryId', event.target.value)} disabled={categoriesLoading} className={controlClass} aria-invalid={Boolean(errors.categoryId)}>
                  <option value="">{categoriesLoading ? 'Loading categories…' : 'Select category'}</option>
                  {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
                </select>{errors.categoryId && <span className="mt-1 block text-xs text-red-600">{errors.categoryId}</span>}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/transactions')} className="rounded border border-[#299D91] px-6 py-3 text-sm font-semibold text-[#299D91] hover:bg-[#299D91]/5">Cancel</button>
              <button type="submit" disabled={saveDisabled} className="min-w-40 rounded bg-[#299D91] px-6 py-3 text-sm font-semibold text-white hover:bg-[#23877d] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Saving…' : 'Save Transaction'}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default AddTransaction
