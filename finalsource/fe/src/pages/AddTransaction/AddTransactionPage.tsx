import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'
import { accountService, type AccountOption } from '../../api/account.service'
import { categoryService } from '../../api/category.service'
import { transactionService } from '../../api/transaction.service'
import type { Category } from '../../api/types'
import { useAuth } from '../../context/AuthContext'
import AddTransactionForm, {
  type TransactionErrors,
  type TransactionField,
  type TransactionFormValues,
} from './AddTransactionForm'

const today = () => {
  const date = new Date()
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 10)
}

const initialValues = (): TransactionFormValues => ({
  accountId: '',
  transactionDate: today(),
  type: 'Expense',
  itemDescription: '',
  category_id: '',
  shopName: '',
  amount: '',
  paymentMethod: '',
  status: 'Complete',
})

const navigation = [
  ['Overview', '/dashboard', 'overview'],
  ['Balances', '/account', 'balances'],
  ['Transactions', '/transactions', 'transactions'],
  ['Bills', '/bills', 'bills'],
  ['Expenses', '/expenses', 'expenses'],
  ['Goals', '/goals', 'goals'],
] as const

type ShellIconName = (typeof navigation)[number][2] | 'settings' | 'logout' | 'chevrons' | 'bell' | 'search' | 'more'

function ShellIcon({ name, className = 'h-5 w-5' }: { name: ShellIconName; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'overview':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
    case 'balances':
      return <svg {...common}><path d="M4 6.5h13a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12" /><path d="M15 11h6v4h-6a2 2 0 0 1 0-4Z" /></svg>
    case 'transactions':
      return <svg {...common}><path d="M7 7h11l-3-3" /><path d="m18 7-3 3" /><path d="M17 17H6l3 3" /><path d="m6 17 3-3" /></svg>
    case 'bills':
      return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>
    case 'expenses':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M12 12v4M10 14h4" /></svg>
    case 'goals':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.38.34.73.65 1 .3.25.68.39 1.07.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></svg>
    case 'logout':
      return <svg {...common}><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" /><path d="m14 8 4 4-4 4M18 12H8" /></svg>
    case 'chevrons':
      return <svg {...common}><path d="m5 8 4 4-4 4M12 8l4 4-4 4" /></svg>
    case 'bell':
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
    case 'more':
      return <svg {...common}><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg>
  }
}

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [values, setValues] = useState<TransactionFormValues>(initialValues)
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<TransactionErrors>({})
  const [accountLoading, setAccountLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadOptions = async () => {
      try {
        const response = await accountService.getAccountOptions()
        const options = response.data?.accounts ?? []
        setAccounts(options)
        if (options.length === 0) setAccountError('No selectable account is available.')
      } catch (error: unknown) {
        if (!axios.isCancel(error)) setAccountError('Accounts could not be loaded. Try again later.')
      } finally {
        setAccountLoading(false)
      }

      try {
        const response = await categoryService.getCategories()
        setCategories(response.data ?? [])
      } catch (error: unknown) {
        if (!axios.isCancel(error)) setCategoryWarning('Categories could not be loaded. You can continue without one.')
      } finally {
        setCategoryLoading(false)
      }
    }

    void loadOptions()
    return () => controller.abort()
  }, [])

  const handleChange = (field: TransactionField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  const validate = (): TransactionErrors => {
    const next: TransactionErrors = {}
    if (!Number.isInteger(Number(values.accountId)) || Number(values.accountId) <= 0) next.accountId = 'Select an account.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.transactionDate) || Number.isNaN(Date.parse(values.transactionDate))) next.transactionDate = 'Enter a valid transaction date.'
    if (values.type !== 'Revenue' && values.type !== 'Expense') next.type = 'Select Revenue or Expense.'
    if (!values.itemDescription.trim()) next.itemDescription = 'Item description is required.'
    if (!values.shopName.trim()) next.shopName = 'Shop name is required.'
    if (!values.paymentMethod.trim()) next.paymentMethod = 'Payment method is required.'
    const amount = Number(values.amount)
    if (!Number.isFinite(amount) || amount < 0.01) next.amount = 'Amount must be at least 0.01.'
    return next
  }

  const mapApiError = (message: string | string[]): TransactionErrors => {
    const text = Array.isArray(message) ? message.join(' ') : message
    const normalized = text.toLowerCase()
    if (normalized.includes('account')) return { accountId: text }
    if (normalized.includes('category')) return { category_id: text }
    if (normalized.includes('amount') || normalized.includes('balance')) return { amount: text }
    if (normalized.includes('date')) return { transactionDate: text }
    if (normalized.includes('description')) return { itemDescription: text }
    if (normalized.includes('shop')) return { shopName: text }
    if (normalized.includes('payment')) return { paymentMethod: text }
    if (normalized.includes('type')) return { type: text }
    return { form: text }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitLoading) return
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSubmitLoading(true)
    try {
      const response = await transactionService.createTransaction({
        accountId: Number(values.accountId),
        transactionDate: values.transactionDate,
        type: values.type,
        itemDescription: values.itemDescription.trim(),
        category_id: values.category_id ? Number(values.category_id) : null,
        shopName: values.shopName.trim(),
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod.trim(),
        status: values.status,
      })
      if (!response.success || !response.data) throw new Error(response.message || 'Transaction creation failed.')
      setSuccessMessage(response.message)
      setValues(initialValues())
      window.setTimeout(() => navigate('/transactions'), 1500)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        const message = error.response?.data?.message
        if ((status === 400 || status === 500) && (typeof message === 'string' || Array.isArray(message))) {
          setErrors(mapApiError(message))
        } else {
          setErrors({ form: 'Transaction could not be created. Check your connection and try again.' })
        }
      } else {
        setErrors({ form: error instanceof Error ? error.message : 'Transaction could not be created.' })
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#1F1F1F] lg:flex lg:min-h-[1024px]">
      <aside className="flex bg-[#191919] px-7 py-7 text-white lg:min-h-[1024px] lg:w-[280px] lg:flex-none lg:flex-col lg:pb-[68px] lg:pt-12">
        <div className="text-[24px] font-bold leading-8 tracking-[0.04em]">FINEbank.IO</div>
        <nav className="ml-0 mt-10 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-none lg:flex-col lg:gap-4" aria-label="Primary navigation">
          {navigation.map(([label, path, icon]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex h-12 items-center gap-3 rounded-[4px] px-4 text-[16px] font-medium transition ${isActive || label === 'Transactions' ? 'bg-[#2FA096] text-white' : 'text-[#B8B8B8] hover:bg-white/10 hover:text-white'}`}>
              <ShellIcon name={icon} className="h-6 w-6 flex-none" />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="flex h-12 items-center gap-3 rounded-[4px] px-4 text-[16px] font-medium text-[#B8B8B8]" aria-label="Settings">
            <ShellIcon name="settings" className="h-6 w-6 flex-none" />
            <span>Settings</span>
          </div>
        </nav>
        <button type="button" onClick={() => { logout(); navigate('/login') }} className="mt-8 flex h-12 w-full items-center gap-3 rounded-[4px] bg-white/[0.06] px-4 text-left text-[16px] font-semibold text-[#C9C9C9] hover:bg-white/10 lg:mt-auto">
          <ShellIcon name="logout" className="h-6 w-6" />
          <span>Logout</span>
        </button>
        <div className="mt-11 flex items-center border-t border-white/10 pt-8 text-sm">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#303030] text-xs font-semibold text-white">{(user?.fullName ?? user?.full_name ?? user?.email ?? 'TR').slice(0, 2).toUpperCase()}</div>
          <div className="ml-4 min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-[#F1F1F1]">{user?.fullName ?? user?.full_name ?? user?.email ?? 'Tanzir Rahman'}</p>
            <p className="mt-0.5 text-xs text-[#B8B8B8]">View profile</p>
          </div>
          <ShellIcon name="more" className="h-6 w-6 text-white" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 border-b border-[#E7E8EA] px-6 py-4">
          <span className="flex items-center gap-1 text-sm text-[#A1A1A1]"><ShellIcon name="chevrons" className="h-5 w-5 text-[#A7A7A7]" />May 19, 2023</span>
          <div className="flex items-center gap-10">
            <span className="relative text-[#656565]" aria-label="Notifications"><ShellIcon name="bell" className="h-6 w-6" /><span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#F4F5F7] bg-[#2FA096]" /></span>
            <div className="relative hidden sm:block"><label className="sr-only" htmlFor="transaction-search">Search</label><input id="transaction-search" className="h-12 w-[352px] rounded-2xl bg-white pl-8 pr-14 text-sm text-[#383838] shadow-[0_14px_28px_rgba(31,36,41,0.08)] outline-none placeholder:text-[#A0A0A0] focus:ring-2 focus:ring-[#2FA096]/30" placeholder="Search here" /><ShellIcon name="search" className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#555555]" /></div>
          </div>
        </header>

        <section className="px-6 pb-6 pt-[18px]">
          <h1 className="text-2xl font-normal text-[#8B8B8B]">Recent Transaction</h1>
          <div className="mt-1 flex min-h-[55px] flex-wrap items-center justify-between gap-4">
            <div className="flex h-full items-center gap-8 text-sm font-semibold"><span className="self-stretch border-b-2 border-[#2FA096] px-2 py-3 text-[#2FA096]">All</span><span className="px-2 py-3 text-[#55565A]">Revenue</span><span className="px-2 py-3 text-[#55565A]">Expenses</span></div>
            <button type="button" className="flex h-[46px] w-[173px] items-center justify-center gap-2 rounded-[4px] bg-[#2FA096] text-sm font-semibold text-white"><span className="text-lg leading-none">+</span><span>Add Transaction</span></button>
          </div>

          <div className="mt-4 min-h-[704px] rounded-2xl bg-white px-6 py-7 shadow-[0_12px_30px_rgba(31,36,41,0.10)] lg:px-8">
            <h2 className="text-[24px] font-semibold leading-8">Add Transaction</h2>
            <p className="mt-3 text-sm leading-5 text-[#6B6B6B]">Enter the transaction details below. Fields marked * are required.</p>
            <div className="mt-5">
              <AddTransactionForm values={values} accounts={accounts} categories={categories} errors={errors} accountLoading={accountLoading} categoryLoading={categoryLoading} submitLoading={submitLoading} accountError={accountError} categoryWarning={categoryWarning} onChange={handleChange} onSubmit={handleSubmit} onCancel={() => navigate('/transactions')} />
            </div>
          </div>
        </section>
      </main>

      {successMessage ? <div role="status" className="fixed right-5 top-5 z-50 rounded-md bg-[#2FA096] px-5 py-3 text-sm font-semibold text-white shadow-lg">{successMessage}</div> : null}
    </div>
  )
}
