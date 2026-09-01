import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { transactionService } from '../../api/transaction.service'
import { Transaction, TransactionFilter } from '../../api/types'
import { useAuth } from '../../context/AuthContext'

const pageSize = 10
const filters: Array<{ label: string; value: TransactionFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Revenue', value: 'Revenue' },
  { label: 'Expenses', value: 'Expense' },
]
const navigation = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'Balances', path: '/account' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Bills', path: '/bills' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Goals', path: '/goals' },
]

interface ErrorEnvelope { message?: string | string[] }

function getErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError<ErrorEnvelope>(error)) return 'Unable to retrieve transactions. Please try again.'
  if (error.code === 'ERR_CANCELED') return null
  const message = error.response?.data?.message
  if (Array.isArray(message)) return message.join(' ')
  if (typeof message === 'string' && message.trim()) return message
  return 'Unable to retrieve transactions. Please try again.'
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)))
  return `${day} ${monthName}, ${year}`
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(value)
}

const MenuIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.7">
    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
  </svg>
)
const TransactionIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.7">
    <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const RowIcon = () => (
  <span className="flex h-7 w-7 items-center justify-center text-[#56585c]" aria-hidden="true">
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7">
      <path d="M6 5h12v15H6zM9 3v4m6-4v4M9 11h6m-6 4h4" strokeLinecap="round" />
    </svg>
  </span>
)

const Transactions = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage
  const requestId = useRef(0)
  const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>('All')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMode, setLoadingMode] = useState<'idle' | 'initial' | 'more'>('idle')
  const [error, setError] = useState('')

  const loadPage = useCallback(async (
    type: TransactionFilter, offset: number, append: boolean, signal?: AbortSignal,
  ) => {
    if (!filters.some((filter) => filter.value === type)) {
      setError('Select a valid transaction type.')
      return
    }
    if (!Number.isInteger(pageSize) || pageSize <= 0 || !Number.isInteger(offset) || offset < 0) {
      setError('Pagination values are invalid.')
      return
    }
    const currentRequest = ++requestId.current
    setError('')
    setLoadingMode(append ? 'more' : 'initial')
    try {
      const response = await transactionService.getTransactions({ type, limit: pageSize, offset }, signal)
      if (currentRequest !== requestId.current) return
      if (!response.success || !response.data) {
        setError(response.message || 'Unable to retrieve transactions. Please try again.')
        return
      }
      const nextRows = response.data.data
      setTransactions((current) => (append ? [...current, ...nextRows] : nextRows))
      setTotal(response.data.total)
      setHasMore(response.data.hasMore)
    } catch (requestError: unknown) {
      if (currentRequest !== requestId.current) return
      const message = getErrorMessage(requestError)
      if (message) setError(message)
    } finally {
      if (currentRequest === requestId.current) setLoadingMode('idle')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setTransactions([])
    setTotal(0)
    setHasMore(false)
    void loadPage(selectedFilter, 0, false, controller.signal)
    return () => {
      requestId.current += 1
      controller.abort()
    }
  }, [loadPage, selectedFilter])

  const handleFilterChange = (filter: TransactionFilter) => {
    if (loadingMode === 'idle' && filter !== selectedFilter) setSelectedFilter(filter)
  }
  const handleLoadMore = () => {
    if (loadingMode === 'idle' && hasMore) void loadPage(selectedFilter, transactions.length, true)
  }
  const handleLogout = () => { logout(); navigate('/login') }
  const displayName = user?.fullName || user?.full_name || user?.username || 'Account'

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans text-[#222] lg:flex">
      <aside className="hidden min-h-screen w-[280px] shrink-0 flex-col bg-[#191919] px-7 py-12 text-[#b7b7b7] lg:flex">
        <div className="px-7 text-[25px] font-bold tracking-[1.5px] text-white">FINEbank.IO</div>
        <nav aria-label="Primary" className="mt-12 space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) =>
              `flex h-12 items-center gap-3 rounded px-4 text-base transition-colors ${isActive ? 'bg-[#299d91] font-semibold text-white' : 'hover:bg-white/5 hover:text-white'}`
            }>
              {item.path === '/transactions' ? <TransactionIcon /> : <MenuIcon />}{item.label}
            </NavLink>
          ))}
          <button type="button" disabled className="flex h-12 w-full cursor-not-allowed items-center gap-3 rounded px-4 text-left opacity-70"><MenuIcon />Settings</button>
        </nav>
        <div className="mt-auto">
          <button type="button" onClick={handleLogout} className="flex h-12 w-full items-center gap-3 rounded bg-white/[0.06] px-4 font-semibold text-[#c8c8c8] hover:bg-white/10 hover:text-white"><TransactionIcon />Logout</button>
          <div className="mt-11 border-t border-white/10 pt-9">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030] text-xs text-white">{displayName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{displayName}</p><p className="text-xs text-[#a8a8a8]">View profile</p></div>
              <span className="ml-auto text-xl text-white" aria-hidden="true">⋮</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[88px] items-center gap-5 border-b border-[#e7e8ea] px-5 sm:px-7">
          <div className="mr-auto flex items-center gap-3 text-sm text-[#9a9a9a]"><span className="text-2xl" aria-hidden="true">»</span><span>May 19, 2023</span></div>
          <button type="button" aria-label="Notifications" aria-disabled="true" className="relative text-[#686868]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2h18l-2-2Z" /></svg>
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#299d91] ring-2 ring-[#f4f5f7]" />
          </button>
          <label className="relative hidden w-[352px] sm:block"><span className="sr-only">Search transactions</span>
            <input type="search" readOnly placeholder="Search here" className="h-12 w-full rounded-xl border-0 bg-white px-8 pr-14 text-base text-[#777] shadow-[0_18px_30px_rgba(0,0,0,0.04)] outline-none" />
            <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 fill-none stroke-[#555]" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
          </label>
        </header>

        <section className="px-5 pb-12 pt-4 sm:px-7 lg:px-6">
          <h1 className="text-[24px] font-normal text-[#8a8a8a]">Recent Transaction</h1>
          <div className="mt-5 flex gap-8" role="tablist" aria-label="Transaction type">
            {filters.map((filter) => {
              const selected = filter.value === selectedFilter
              return <button key={filter.value} type="button" role="tab" aria-selected={selected} disabled={loadingMode !== 'idle'} onClick={() => handleFilterChange(filter.value)} className={`border-b-2 px-2 pb-2 text-base font-semibold transition-colors disabled:cursor-wait ${selected ? 'border-[#299d91] text-[#299d91]' : 'border-transparent text-[#55565a] hover:text-[#299d91]'}`}>{filter.label}</button>
            })}
          </div>

          <div className="mt-1 min-h-[600px] overflow-hidden rounded-2xl bg-white px-5 pb-10 pt-3 shadow-[0_18px_40px_rgba(0,0,0,0.06)] sm:px-7">
            {successMessage && <div role="status" className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
            {error && <div role="alert" className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {loadingMode === 'initial' ? (
              <div className="flex min-h-[480px] items-center justify-center text-[#777]" role="status">Loading transactions…</div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-[480px] items-center justify-center text-[#777]">No transactions match the selected filter.</div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[880px] table-fixed">
                <thead><tr className="border-b border-[#ececec] text-left text-base font-semibold"><th className="w-[27%] px-2 py-4">Items</th><th className="w-[23%] px-2 py-4 text-center">Shop Name</th><th className="w-[20%] px-2 py-4 text-center">Date</th><th className="w-[20%] px-2 py-4 text-center">Payment Method</th><th className="w-[10%] px-2 py-4 text-right">Amount</th></tr></thead>
                <tbody>{transactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="border-b border-[#ececec] last:border-b-0">
                    <td className="px-2 py-6"><div className="flex items-center gap-3 font-semibold"><RowIcon /><span>{transaction.item_description}</span></div></td>
                    <td className="px-2 py-6 text-center text-[#666]">{transaction.shop_name}</td>
                    <td className="px-2 py-6 text-center text-[#666]">{formatDate(transaction.transaction_date)}</td>
                    <td className="px-2 py-6 text-center text-[#666]">{transaction.payment_method}</td>
                    <td className="px-2 py-6 text-right font-semibold">{formatAmount(transaction.amount)}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
            {hasMore && loadingMode !== 'initial' && <div className="mt-8 flex justify-center"><button type="button" onClick={handleLoadMore} disabled={loadingMode !== 'idle'} className="h-12 min-w-48 rounded bg-[#299d91] px-8 font-semibold text-white hover:bg-[#23877d] disabled:cursor-wait disabled:opacity-70">{loadingMode === 'more' ? 'Loading…' : 'Load More'}</button></div>}
            {transactions.length > 0 && <p className="sr-only" aria-live="polite">Showing {transactions.length} of {total} transactions.</p>}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Transactions
