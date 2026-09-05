import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import type { AccountListItem } from '../../api/types'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/accounts', label: 'Balances', icon: '▣' },
  { path: '/transactions', label: 'Transactions', icon: '↔' },
  { path: '/bills', label: 'Bills', icon: '▤' },
  { path: '/expenses', label: 'Expenses', icon: '◫' },
  { path: '/goals', label: 'Goals', icon: '◎' },
]

const formatBalance = (balance: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(balance)

const AccountCard = ({ account }: { account: AccountListItem }) => (
  <article className="flex min-h-[305px] flex-col rounded-lg bg-white p-6 shadow-[0_20px_25px_rgba(76,103,100,0.10)]">
    <div className="flex min-h-11 items-start justify-between gap-4 border-b border-[#d2d2d240] pb-3">
      <h2 className="text-base font-bold capitalize text-[#878787]">{account.account_type}</h2>
      <div className="text-right">
        <p className="text-xs font-medium text-[#666]">{account.bank_name}</p>
        {account.branch_name && <p className="mt-1 text-[11px] text-[#9f9f9f]">{account.branch_name}</p>}
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-6 pt-6">
      <div className="space-y-1">
        <p className="break-all text-xl font-semibold tracking-[0.08em] text-[#191919]">
          **** {account.account_number_last_4}
        </p>
        <p className="text-sm text-[#9f9f9f]">Account Number</p>
      </div>
      <div className="space-y-1">
        <p className="text-xl font-semibold text-[#191919]">{formatBalance(account.balance)}</p>
        <p className="text-sm text-[#9f9f9f]">Total amount</p>
      </div>
    </div>

    <div className="mt-6 flex items-center justify-between">
      <button type="button" disabled className="cursor-not-allowed text-base text-[#299d91] opacity-80">
        Remove
      </button>
      <Link
        to={`/accounts/${account.id}`}
        className="rounded bg-[#299d91] px-5 py-2 text-sm font-medium text-white hover:bg-[#23877e] focus:outline-none focus:ring-2 focus:ring-[#299d91] focus:ring-offset-2"
      >
        Details <span aria-hidden="true">›</span>
      </Link>
    </div>
  </article>
)

const Account = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const loadAccounts = useCallback(async () => {
    if (activeRequest.current) return

    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)
    setAccounts([])

    try {
      const response = await accountService.getAccounts(controller.signal)
      if (!response.success || !response.data || !Array.isArray(response.data.accounts)) {
        throw new Error('Malformed account-list response')
      }
      setAccounts(response.data.accounts)
    } catch (requestError: unknown) {
      if (axios.isCancel(requestError)) return

      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setAccounts([])
        return
      }

      const serverMessage = axios.isAxiosError<{ message?: string | string[] }>(requestError)
        ? requestError.response?.data?.message
        : undefined
      setError(
        typeof serverMessage === 'string'
          ? serverMessage
          : 'We could not load your accounts. Please try again.',
      )
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadAccounts()
    return () => activeRequest.current?.abort()
  }, [loadAccounts])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-['Inter',sans-serif] text-[#191919] lg:flex">
      <aside className="flex bg-[#191919] text-white lg:fixed lg:inset-y-0 lg:w-[280px] lg:flex-col">
        <div className="flex w-full items-center justify-between gap-6 px-5 py-5 lg:flex-col lg:items-stretch lg:px-6 lg:py-8">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">FINEbank.IO</Link>
          <nav className="flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col" aria-label="Primary navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-3 rounded px-4 py-3 text-sm transition-colors ${
                    isActive ? 'bg-[#299d91] font-semibold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span aria-hidden="true" className="w-5 text-center">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:mt-auto lg:block">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.14]"
            >
              <span aria-hidden="true">↪</span> Logout
            </button>
            <div className="mt-8 border-t border-white/[0.08] pt-8">
              <p className="text-sm font-semibold">{user?.fullName || user?.full_name || user?.username || 'Account user'}</p>
              <p className="text-xs text-white/60">View profile</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[280px]">
        <header className="flex min-h-[80px] items-center justify-between border-b border-[#e8e8e8] bg-white px-6 lg:px-10">
          <p className="text-sm text-[#9f9f9f]">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())}</p>
          <div className="flex items-center gap-6">
            <span aria-label="Notifications" className="text-[#299d91]">●</span>
            <div className="hidden rounded-xl bg-white px-6 py-3 text-sm text-[#9f9f9f] shadow-[0_10px_24px_rgba(76,103,100,0.08)] sm:block">
              Search here <span aria-hidden="true" className="ml-20">⌕</span>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-10">
          <h1 className="mb-6 text-[22px] font-normal leading-8 text-[#878787]">Balances</h1>

          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-label="Loading accounts">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-[305px] animate-pulse rounded-lg bg-white p-6 shadow-sm">
                  <div className="h-5 w-2/5 rounded bg-[#e4e7eb]" />
                  <div className="mt-10 h-6 w-4/5 rounded bg-[#e4e7eb]" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-[#f0f1f2]" />
                  <div className="mt-8 h-6 w-1/2 rounded bg-[#e4e7eb]" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <section className="rounded-lg bg-white p-8 text-center shadow-sm" role="alert">
              <p className="text-[#666]">{error}</p>
              <button
                type="button"
                onClick={() => void loadAccounts()}
                disabled={isLoading}
                className="mt-5 rounded bg-[#299d91] px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                Try again
              </button>
            </section>
          )}

          {!isLoading && !error && accounts.length === 0 && (
            <section className="rounded-lg bg-white px-6 py-16 text-center shadow-[0_20px_25px_rgba(76,103,100,0.10)]">
              <h2 className="text-xl font-semibold">No bank accounts yet</h2>
              <p className="mt-2 text-sm text-[#878787]">Add an account to see your balances in one place.</p>
              <Link to="/accounts/add" className="mt-6 inline-flex rounded bg-[#299d91] px-8 py-3 font-semibold text-white">
                Add Account
              </Link>
            </section>
          )}

          {!isLoading && !error && accounts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
              <article className="flex min-h-[305px] flex-col items-center justify-center rounded-lg bg-white p-6 shadow-[0_20px_25px_rgba(76,103,100,0.10)]">
                <Link to="/accounts/add" className="rounded bg-[#299d91] px-8 py-3 font-semibold text-white">Add Accounts</Link>
                <button type="button" disabled className="mt-3 cursor-not-allowed text-sm text-[#9f9f9f]">Edit Accounts</button>
              </article>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Account

