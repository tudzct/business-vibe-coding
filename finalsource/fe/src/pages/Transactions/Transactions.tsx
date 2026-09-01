import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'
import { transactionService } from '../../api/transaction.service'
import type { Transaction } from '../../api/types'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  ['Overview', '/dashboard', 'overview'],
  ['Balances', '/account', 'balances'],
  ['Transactions', '/transactions', 'transactions'],
  ['Bills', '/bills', 'bills'],
  ['Expenses', '/expenses', 'expenses'],
  ['Goals', '/goals', 'goals'],
] as const

type Filter = 'All' | 'Revenue' | 'Expenses'
type IconName = (typeof navigation)[number][2] | 'settings' | 'logout' | 'chevrons' | 'bell' | 'search' | 'more'

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
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
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      )
    case 'balances':
      return (
        <svg {...common}>
          <path d="M4 6.5h13a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12" />
          <path d="M15 11h6v4h-6a2 2 0 0 1 0-4Z" />
        </svg>
      )
    case 'transactions':
      return (
        <svg {...common}>
          <path d="M7 7h11l-3-3" />
          <path d="m18 7-3 3" />
          <path d="M17 17H6l3 3" />
          <path d="m6 17 3-3" />
        </svg>
      )
    case 'bills':
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      )
    case 'expenses':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18M12 12v4M10 14h4" />
        </svg>
      )
    case 'goals':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 15a2 2 0 0 0 .4 2l-2.4 2.4a2 2 0 0 0-2-.4 2 2 0 0 0-1.3 1.6H10A2 2 0 0 0 8.6 19a2 2 0 0 0-2 .4L4.2 17a2 2 0 0 0 .4-2A2 2 0 0 0 3 13.7v-3.4A2 2 0 0 0 4.6 9a2 2 0 0 0-.4-2L6.6 4.6a2 2 0 0 0 2 .4A2 2 0 0 0 10 3.4h3.4A2 2 0 0 0 15 5a2 2 0 0 0 2-.4L19.4 7a2 2 0 0 0-.4 2 2 2 0 0 0 1.6 1.3v3.4A2 2 0 0 0 19 15Z" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" />
          <path d="m14 8 4 4-4 4M18 12H8" />
        </svg>
      )
    case 'chevrons':
      return (
        <svg {...common}>
          <path d="m5 8 4 4-4 4M12 8l4 4-4 4" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )
    case 'more':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))

export default function Transactions() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(7)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadTransactions = async () => {
      try {
        const response = await transactionService.getTransactions()
        if (active) {
          const list = response.data?.data ?? (Array.isArray(response.data) ? response.data : [])
          setTransactions(list)
        }
      } catch (error: unknown) {
        if (active && !axios.isCancel(error)) {
          setLoadError('Transaction history is currently unavailable. You can still add a transaction.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadTransactions()
    return () => {
      active = false
    }
  }, [])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return transactions.filter((transaction) => {
      const matchesType =
        activeFilter === 'All' ||
        transaction.type === (activeFilter === 'Expenses' ? 'Expense' : 'Revenue')
      const matchesSearch =
        !query ||
        [transaction.item_description, transaction.shop_name, transaction.payment_method].some((value) =>
          value?.toLowerCase().includes(query),
        )
      return matchesType && matchesSearch
    })
  }, [activeFilter, search, transactions])

  const selectFilter = (filter: Filter) => {
    setActiveFilter(filter)
    setVisibleCount(7)
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#1F1F1F] lg:flex lg:min-h-[1024px]">
      <aside className="flex bg-[#191919] px-7 py-7 text-white lg:min-h-[1024px] lg:w-[280px] lg:flex-none lg:flex-col lg:pb-[68px] lg:pt-12">
        <div className="text-[24px] font-bold leading-8 tracking-[0.04em]">FINEbank.IO</div>
        <nav
          className="mt-10 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-none lg:flex-col lg:gap-4"
          aria-label="Primary navigation"
        >
          {navigation.map(([label, path, icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-[4px] px-4 text-[16px] font-medium transition ${
                  isActive ? 'bg-[#2FA096] text-white' : 'text-[#B8B8B8] hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon name={icon} className="h-6 w-6 flex-none" />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="flex h-12 items-center gap-3 rounded-[4px] px-4 text-[16px] font-medium text-[#B8B8B8]">
            <Icon name="settings" className="h-6 w-6" />
            <span>Settings</span>
          </div>
        </nav>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="mt-8 flex h-12 w-full items-center gap-3 rounded-[4px] bg-white/[0.06] px-4 text-left text-[16px] font-semibold text-[#C9C9C9] hover:bg-white/10 lg:mt-auto"
        >
          <Icon name="logout" className="h-6 w-6" />
          <span>Logout</span>
        </button>
        <div className="mt-11 flex items-center border-t border-white/10 pt-8 text-sm">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#303030] text-xs font-semibold">
            {(user?.fullName ?? user?.full_name ?? user?.email ?? 'TR').slice(0, 2).toUpperCase()}
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-[#F1F1F1]">
              {user?.fullName ?? user?.full_name ?? user?.email ?? 'Tanzir Rahman'}
            </p>
            <p className="mt-0.5 text-xs text-[#B8B8B8]">View profile</p>
          </div>
          <Icon name="more" className="h-6 w-6" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 border-b border-[#E7E8EA] px-6 py-4">
          <span className="flex items-center gap-1 text-sm text-[#A1A1A1]">
            <Icon name="chevrons" className="h-5 w-5" />
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
              new Date(),
            )}
          </span>
          <div className="flex items-center gap-10">
            <span className="relative text-[#656565]" aria-label="Notifications">
              <Icon name="bell" className="h-6 w-6" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#F4F5F7] bg-[#2FA096]" />
            </span>
            <div className="relative hidden sm:block">
              <label className="sr-only" htmlFor="transaction-search">
                Search transactions
              </label>
              <input
                id="transaction-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-[352px] rounded-2xl bg-white pl-8 pr-14 text-sm shadow-[0_14px_28px_rgba(31,36,41,0.08)] outline-none placeholder:text-[#A0A0A0] focus:ring-2 focus:ring-[#2FA096]/30"
                placeholder="Search here"
              />
              <Icon
                name="search"
                className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#555555]"
              />
            </div>
          </div>
        </header>

        <section className="px-6 pb-6 pt-[18px]">
          <h1 className="text-2xl font-normal text-[#8B8B8B]">Recent Transaction</h1>
          <div className="mt-1 flex min-h-[55px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm font-semibold" role="tablist" aria-label="Transaction type">
              {(['All', 'Revenue', 'Expenses'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => selectFilter(filter)}
                  className={`border-b-2 px-2 py-3 ${
                    activeFilter === filter
                      ? 'border-[#2FA096] text-[#2FA096]'
                      : 'border-transparent text-[#55565A] hover:text-[#2FA096]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/transactions/add')}
              className="flex h-[46px] w-[173px] items-center justify-center gap-2 rounded-[4px] bg-[#2FA096] text-sm font-semibold text-white hover:bg-[#278d84] focus:outline-none focus:ring-2 focus:ring-[#2FA096]/40"
            >
              <span className="text-lg leading-none">+</span>
              <span>Add Transaction</span>
            </button>
          </div>

          <div className="mt-4 min-h-[704px] overflow-x-auto rounded-2xl bg-white px-6 py-3 shadow-[0_12px_30px_rgba(31,36,41,0.10)] lg:px-7">
            {loading ? <p className="py-16 text-center text-[#777]">Loading transactions...</p> : null}
            {!loading && loadError ? (
              <div className="mx-auto mt-16 max-w-lg rounded-lg bg-[#F4F5F7] px-6 py-5 text-center text-sm text-[#666]">
                {loadError}
              </div>
            ) : null}
            {!loading && !loadError && filteredTransactions.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-semibold text-[#444]">No transactions found</p>
                <p className="mt-2 text-sm text-[#777]">Choose “Add Transaction” to create one.</p>
              </div>
            ) : null}
            {!loading && !loadError && filteredTransactions.length > 0 ? (
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="h-14 border-b border-[#ECECEC] text-sm">
                    <th className="px-2 font-semibold">Items</th>
                    <th className="px-2 font-semibold">Shop Name</th>
                    <th className="px-2 font-semibold">Date</th>
                    <th className="px-2 font-semibold">Payment Method</th>
                    <th className="px-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, visibleCount).map((transaction) => (
                    <tr key={transaction.transaction_id} className="h-[72px] border-b border-[#ECECEC] last:border-0">
                      <td className="px-2 font-semibold">{transaction.item_description}</td>
                      <td className="px-2 text-[#666]">{transaction.shop_name || '—'}</td>
                      <td className="px-2 text-[#666]">{formatDate(transaction.transaction_date)}</td>
                      <td className="px-2 text-[#666]">{transaction.payment_method || '—'}</td>
                      <td
                        className={`px-2 text-right font-semibold ${
                          transaction.type === 'Expense' ? 'text-[#1F1F1F]' : 'text-[#2FA096]'
                        }`}
                      >
                        {formatAmount(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {!loading && !loadError && visibleCount < filteredTransactions.length ? (
              <div className="flex justify-center py-8">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 7)}
                  className="h-12 w-48 rounded-[4px] bg-[#2FA096] text-sm font-semibold text-white hover:bg-[#278d84]"
                >
                  Load More
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
