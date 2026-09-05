import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { accountService } from '../../api/account.service'
import type { AccountDetail, AccountDetailTransaction } from '../../api/types'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { path: '/dashboard', label: 'Overview' },
  { path: '/accounts', label: 'Balances' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/bills', label: 'Bills' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/goals', label: 'Goals' },
  { path: '/settings', label: 'Settings', visualOnly: true },
]

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)

const safeMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.join(' ')
  }
  return fallback
}

const amountForDisplay = (transaction: AccountDetailTransaction) => {
  const absoluteAmount = Math.abs(transaction.amount)
  return transaction.type === 'Expense' ? -absoluteAmount : absoluteAmount
}

const statusClass: Record<AccountDetailTransaction['status'], string> = {
  Complete: 'bg-[#e4f5f3] text-[#299d91]',
  Pending: 'bg-[#fff0d5] text-[#e5a33b]',
  Failed: 'bg-[#fde7e7] text-[#e44f4f]',
}

const AccountDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validAccountId = useMemo(
    () => (id && /^\d+$/.test(id) ? id : null),
    [id],
  )

  useEffect(() => {
    if (!validAccountId) {
      setAccount(null)
      setIsLoading(false)
      setError('Invalid account identifier.')
      return
    }

    const controller = new AbortController()
    let active = true
    setAccount(null)
    setError(null)
    setIsLoading(true)

    const fetchAccountDetails = async () => {
      try {
        const response = await accountService.getAccountDetails(validAccountId, controller.signal)
        if (!active) return
        if (!response.success || !response.data) {
          setError(safeMessage(response.message, 'We could not load this account.'))
          return
        }
        setAccount(response.data)
      } catch (requestError: unknown) {
        if (!active || axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) return

        const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
        const fallback =
          status === 500
            ? 'A banking system error occurred. Please try again later.'
            : 'We could not load this account. Please try again.'
        const responseMessage = axios.isAxiosError<{ message?: string | string[] }>(requestError)
          ? requestError.response?.data?.message
          : undefined
        setError(safeMessage(responseMessage, fallback))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void fetchAccountDetails()
    return () => {
      active = false
      controller.abort()
    }
  }, [validAccountId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f6f7] font-['Inter',sans-serif] text-[#292b2f] lg:flex">
      <aside className="bg-[#1d1f20] text-white lg:fixed lg:inset-y-0 lg:flex lg:w-[244px] lg:flex-col">
        <div className="flex items-center justify-between px-7 py-7 lg:block">
          <Link to="/dashboard" className="text-lg font-bold tracking-tight">FINEbank.IO</Link>
          <nav className="flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col" aria-label="Primary navigation">
            {navigation.map((item) => item.visualOnly ? (
              <span key={item.path} className="flex min-w-max items-center gap-3 rounded px-3 py-3 text-sm text-white/70">
                <span aria-hidden="true" className="h-4 w-4 rounded-sm border border-white/70" />{item.label}
              </span>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex min-w-max items-center gap-3 rounded px-3 py-3 text-sm ${
                  isActive ? 'bg-[#35aaa2] font-medium text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="h-4 w-4 rounded-sm border border-current" />{item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="m-7 mt-auto hidden items-center gap-3 rounded bg-white/[0.04] px-3 py-3 text-sm text-white/70 hover:bg-white/10 lg:flex"
        >
          <span aria-hidden="true" className="h-4 w-4 rounded-sm border border-current" />Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[244px]">
        <header className="flex min-h-[72px] items-center justify-between border-b border-[#eceeef] bg-white px-6 lg:px-8">
          <p className="text-sm"><Link to="/accounts" className="font-medium">Accounts</Link><span className="mx-3 text-[#a6abb3]">›</span><span className="text-[#8f96a1]">Account Details</span></p>
          <div className="flex items-center gap-4">
            <div className="hidden h-10 w-[260px] items-center justify-between rounded-lg bg-[#f1f2f3] px-4 text-sm text-[#a1a6ae] sm:flex">Search here <span aria-hidden="true">⌕</span></div>
            <span aria-label="User profile" className="h-8 w-8 rounded-full bg-[#f0f1f2]" />
          </div>
        </header>

        <main className="px-6 py-8 lg:px-[38px]">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold leading-9">Account Details</h1>
              <p className="mt-1 text-sm text-[#9097a2]">View account information and the five most recent transactions.</p>
            </div>
            <button type="button" disabled={!account} className="rounded bg-[#35aaa2] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Edit Account</button>
          </div>

          {isLoading && (
            <section className="space-y-5" aria-live="polite" aria-label="Loading account details">
              <div className="h-[228px] animate-pulse rounded-lg bg-white shadow-[0_12px_30px_rgba(76,103,100,0.07)]" />
              <div className="h-[360px] animate-pulse rounded-lg bg-white shadow-[0_12px_30px_rgba(76,103,100,0.07)]" />
            </section>
          )}

          {!isLoading && error && (
            <section role="alert" className="rounded-lg bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-lg font-semibold">Account details unavailable</h2>
              <p className="mt-2 text-sm text-[#707782]">{error}</p>
              {validAccountId && <button type="button" onClick={() => navigate(0)} className="mt-6 rounded bg-[#35aaa2] px-5 py-3 text-sm font-medium text-white">Try again</button>}
            </section>
          )}

          {!isLoading && !error && account && (
            <div className="space-y-5">
              <section className="rounded-lg bg-white p-7 shadow-[0_12px_30px_rgba(76,103,100,0.07)]" aria-labelledby="account-summary-heading">
                <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#e2e5e8] pb-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e5f6f4] text-lg font-semibold text-[#27a397]" aria-hidden="true">{account.bank_name.charAt(0).toUpperCase()}</span>
                    <div><h2 id="account-summary-heading" className="text-xl font-medium">{account.bank_name}</h2><p className="mt-1 text-sm text-[#9299a3]">{account.account_type} • Account ending {account.account_number_full.slice(-4)}</p></div>
                  </div>
                  <div className="text-left sm:text-right"><p className="text-xs text-[#9299a3]">Current balance</p><p className="mt-1 text-2xl font-bold">{formatMoney(account.balance)}</p></div>
                </div>
                <dl className="grid gap-6 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-xs text-[#9299a3]">Bank name</dt><dd className="mt-1 font-medium">{account.bank_name}</dd></div>
                  <div><dt className="text-xs text-[#9299a3]">Account type</dt><dd className="mt-1 font-medium">{account.account_type}</dd></div>
                  <div><dt className="text-xs text-[#9299a3]">Branch</dt><dd className="mt-1 font-medium">{account.branch_name || '—'}</dd></div>
                  <div><dt className="text-xs text-[#9299a3]">Full account number</dt><dd className="mt-1 break-all font-medium">{account.account_number_full}</dd></div>
                </dl>
              </section>

              <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(76,103,100,0.07)]" aria-labelledby="recent-transactions-heading">
                <div className="mb-2 flex items-center justify-between"><h2 id="recent-transactions-heading" className="text-xl font-medium">Recent Transactions</h2><span className="text-xs text-[#9299a3]">Latest 5</span></div>
                {account.recent_transactions.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#8f96a1]">No recent transactions for this account.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-[#f7f8f9] text-xs font-normal text-[#7f8792]"><tr><th className="px-3 py-3 font-normal">Date</th><th className="px-3 py-3 font-normal">Description</th><th className="px-3 py-3 font-normal">Status</th><th className="px-3 py-3 text-right font-normal">Amount</th></tr></thead>
                      <tbody>{account.recent_transactions.slice(0, 5).map((transaction, index) => {
                        const displayAmount = amountForDisplay(transaction)
                        return <tr key={`${transaction.date}-${transaction.description}-${index}`} className="border-b border-[#f0f1f2] last:border-0"><td className="px-3 py-4 text-[#8f96a1]">{transaction.date}</td><td className="px-3 py-4">{transaction.description}</td><td className="px-3 py-4"><span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs ${statusClass[transaction.status]}`}>{transaction.status}</span></td><td className={`px-3 py-4 text-right ${displayAmount < 0 ? 'text-[#e84b4b]' : 'text-[#20a397]'}`}>{displayAmount > 0 ? '+' : ''}{formatMoney(displayAmount)}</td></tr>
                      })}</tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AccountDetailPage
