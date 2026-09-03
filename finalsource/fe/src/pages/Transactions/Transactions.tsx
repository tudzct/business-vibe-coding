import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { transactionService } from '../../api/transaction.service'
import type { Transaction, TransactionFilter } from '../../api/types'
import { useAuth } from '../../context/AuthContext'

const pageSize = 10
const filters: ReadonlyArray<{ readonly label: string; readonly value: TransactionFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Revenue', value: 'Revenue' },
  { label: 'Expenses', value: 'Expense' },
]

type LoadingMode = 'idle' | 'replace' | 'more'

interface SafeRequestError {
  readonly status?: number
  readonly message: string
}

const getRequestError = (error: unknown): SafeRequestError => {
  if (!axios.isAxiosError(error)) {
    return { message: 'Unable to load transactions. Please try again.' }
  }

  const body: unknown = error.response?.data
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string') {
      return { status: error.response?.status, message }
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return { status: error.response?.status, message: message.join(' ') }
    }
  }

  return {
    status: error.response?.status,
    message: 'Unable to load transactions. Please try again.',
  }
}

const formatTransactionDate = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)

const Transactions: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const requestSequence = useRef(0)
  const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>('All')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMode, setLoadingMode] = useState<LoadingMode>('replace')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestSequence.current

    const loadFirstPage = async (): Promise<void> => {
      setLoadingMode('replace')
      setError('')
      setTransactions([])

      try {
        const response = await transactionService.getTransactions(
          { type: selectedFilter, limit: pageSize, offset: 0 },
          controller.signal
        )
        if (requestId !== requestSequence.current) return
        if (!response.success || !response.data) {
          setError(response.message || 'Unable to load transactions. Please try again.')
          return
        }
        setTransactions(response.data.data)
        setTotal(response.data.total)
        setHasMore(response.data.hasMore)
      } catch (requestError: unknown) {
        if (controller.signal.aborted || requestId !== requestSequence.current) return
        const failure = getRequestError(requestError)
        if (failure.status !== 401) setError(failure.message)
      } finally {
        if (requestId === requestSequence.current) setLoadingMode('idle')
      }
    }

    void loadFirstPage()
    return () => controller.abort()
  }, [selectedFilter])

  const loadMore = async (): Promise<void> => {
    if (loadingMode !== 'idle' || !hasMore) return
    const offset = transactions.length
    if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(pageSize) || pageSize <= 0) {
      setError('The transaction pagination values are invalid.')
      return
    }

    const requestId = ++requestSequence.current
    setLoadingMode('more')
    setError('')
    try {
      const response = await transactionService.getTransactions({
        type: selectedFilter,
        limit: pageSize,
        offset,
      })
      if (requestId !== requestSequence.current) return
      if (!response.success || !response.data) {
        setError(response.message || 'Unable to load more transactions. Please try again.')
        return
      }
      const page = response.data
      setTransactions((current) => [...current, ...page.data])
      setTotal(page.total)
      setHasMore(page.hasMore)
    } catch (requestError: unknown) {
      if (requestId !== requestSequence.current) return
      const failure = getRequestError(requestError)
      if (failure.status !== 401) setError(failure.message)
    } finally {
      if (requestId === requestSequence.current) setLoadingMode('idle')
    }
  }

  const navigation = [
    { label: 'Overview', path: '/dashboard', icon: '▦' },
    { label: 'Balances', path: '/account', icon: '▣' },
    { label: 'Transactions', path: '/transactions', icon: '⇄' },
    { label: 'Bills', path: '/bills', icon: '▤' },
    { label: 'Expenses', path: '/expenses', icon: '▧' },
    { label: 'Goals', path: '/goals', icon: '◉' },
  ] as const

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account User'
  const topDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#252525] lg:flex">
      <aside className="flex bg-[#191919] text-[#bdbdbd] lg:min-h-screen lg:w-[280px] lg:flex-col">
        <div className="flex w-full items-center gap-5 overflow-x-auto px-5 py-4 lg:block lg:overflow-visible lg:px-7 lg:py-12">
          <div className="mr-4 shrink-0 text-2xl font-bold tracking-[0.06em] text-white lg:mb-12 lg:px-7">
            FINE<span className="font-medium">bank.IO</span>
          </div>
          <nav aria-label="Primary" className="flex gap-2 lg:block lg:space-y-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-4 rounded px-4 py-3 text-sm font-medium transition-colors lg:w-full ${
                    isActive
                      ? 'bg-[#299D91] text-white'
                      : 'hover:bg-white/10 hover:text-white focus-visible:bg-white/10'
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

          <div className="hidden lg:mt-auto lg:block lg:pt-52">
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="flex w-full items-center gap-4 rounded bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#299D91]"
            >
              <span aria-hidden="true" className="text-xl">↪</span>
              Logout
            </button>
            <div className="mt-11 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#3b3b3b] text-sm font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs">View profile</p>
                </div>
                <span aria-hidden="true" className="text-xl text-white">⋮</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[88px] items-center justify-between border-b border-black/5 px-6 lg:px-7">
          <div className="flex items-center gap-2 text-sm text-[#9d9d9d]">
            <span aria-hidden="true" className="text-2xl">»</span>
            {topDate}
          </div>
          <div className="flex items-center gap-7">
            <button type="button" disabled aria-label="Notifications" className="relative cursor-default text-xl text-[#555]">
              ●<span className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-[#299D91]" />
            </button>
            <label className="hidden h-12 w-[352px] items-center rounded-xl bg-white px-8 shadow-[0_12px_32px_rgba(0,0,0,0.05)] sm:flex">
              <span className="sr-only">Search</span>
              <input readOnly value="" placeholder="Search here" className="min-w-0 flex-1 bg-transparent text-sm text-[#666] outline-none" />
              <span aria-hidden="true" className="text-2xl text-[#555]">⌕</span>
            </label>
          </div>
        </header>

        <section className="px-6 pb-10 pt-5 lg:px-6">
          <h1 className="text-2xl font-normal text-[#8a8a8a]">Recent Transaction</h1>
          <div className="mt-5 flex gap-9" role="tablist" aria-label="Transaction type">
            {filters.map((filter) => {
              const active = selectedFilter === filter.value
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={loadingMode === 'replace'}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`border-b-2 px-2 pb-2 text-sm font-semibold transition-colors disabled:cursor-wait ${
                    active ? 'border-[#299D91] text-[#299D91]' : 'border-transparent text-[#555]'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="mt-4 min-h-[704px] overflow-hidden rounded-2xl bg-white px-7 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.06)]">
            {error && (
              <div role="alert" className="my-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] table-fixed text-left">
                <thead>
                  <tr className="border-b border-[#eeeeee] text-sm font-semibold text-[#242424]">
                    <th className="w-[25%] px-2 py-4">Items</th>
                    <th className="w-[22%] px-2 py-4">Shop Name</th>
                    <th className="w-[20%] px-2 py-4">Date</th>
                    <th className="w-[20%] px-2 py-4">Payment Method</th>
                    <th className="w-[13%] px-2 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className="border-b border-[#eeeeee] last:border-b-0">
                      <td className="px-2 py-5 text-sm font-semibold">
                        <span className="mr-4 inline-grid h-6 w-6 place-items-center rounded border border-[#777] text-xs text-[#666]" aria-hidden="true">
                          {transaction.type === 'Revenue' ? '+' : '–'}
                        </span>
                        {transaction.item_description}
                      </td>
                      <td className="px-2 py-5 text-sm text-[#666]">{transaction.shop_name}</td>
                      <td className="px-2 py-5 text-sm text-[#666]">{formatTransactionDate(transaction.transaction_date)}</td>
                      <td className="px-2 py-5 text-sm text-[#666]">{transaction.payment_method}</td>
                      <td className="px-2 py-5 text-right text-sm font-semibold">{formatAmount(transaction.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loadingMode === 'replace' && (
              <div role="status" className="grid min-h-[420px] place-items-center text-sm text-[#777]">
                Loading transactions…
              </div>
            )}

            {loadingMode !== 'replace' && transactions.length === 0 && !error && (
              <div className="grid min-h-[420px] place-items-center text-sm text-[#777]">
                No transactions are found!
              </div>
            )}

            {transactions.length > 0 && hasMore && (
              <div className="flex justify-center py-12">
                <button
                  type="button"
                  disabled={loadingMode !== 'idle'}
                  onClick={() => void loadMore()}
                  className="min-w-48 rounded bg-[#299D91] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#23877d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#299D91] disabled:cursor-wait disabled:opacity-70"
                >
                  {loadingMode === 'more' ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}

            {transactions.length > 0 && (
              <p className="pb-4 text-center text-xs text-[#999]" aria-live="polite">
                Showing {transactions.length} of {total}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Transactions

