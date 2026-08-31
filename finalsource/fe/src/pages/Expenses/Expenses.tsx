import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { expenseService } from '../../api/expense.service'
import type { ExpenseSummaryItem } from '../../api/types'
import { useAuth } from '../../context/AuthContext'

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

const navigationItems = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/account', label: 'Balances', icon: '▣' },
  { path: '/transactions', label: 'Transactions', icon: '⇄' },
  { path: '/bills', label: 'Bills', icon: '▧' },
  { path: '/expenses', label: 'Expenses', icon: '▤' },
  { path: '/goals', label: 'Goals', icon: '◉' },
] as const

interface ChartItem {
  month: (typeof monthNames)[number]
  totalExpense: number | null
}

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)

const formatAxisAmount = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

const isExpenseSummaryItem = (value: unknown): value is ExpenseSummaryItem => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const item = value as Record<string, unknown>
  return (
    typeof item.month === 'string' &&
    typeof item.totalExpense === 'number' &&
    Number.isFinite(item.totalExpense)
  )
}

const getSafeErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload: unknown = error.response?.data
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = payload.message
      if (typeof message === 'string' && message.trim()) {
        return message
      }
      if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
        return message.join(' ')
      }
    }
  }
  return 'Unable to load expense data. Please try again.'
}

const ExpenseSummaryChart = ({ data }: { readonly data: ChartItem[] }) => {
  const currentMonth = monthNames[new Date().getMonth()]

  return (
    <div className="h-[300px] w-full sm:h-[340px]" aria-label="Monthly expense comparison chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 8, bottom: 4, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#E8E8E8" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9A9A9A', fontSize: 13 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9A9A9A', fontSize: 13 }}
            tickFormatter={formatAxisAmount}
            width={58}
          />
          <Tooltip
            cursor={{ fill: '#F4F5F7' }}
            formatter={(value) => [formatAmount(Number(value)), 'Expense']}
            contentStyle={{ border: 0, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}
          />
          <Bar dataKey="totalExpense" radius={[5, 5, 0, 0]} maxBarSize={30}>
            {data.map((item) => (
              <Cell
                key={item.month}
                fill={item.month === currentMonth ? '#299D91' : '#DADADA'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>Monthly expense totals</caption>
        <thead><tr><th>Month</th><th>Total expense</th></tr></thead>
        <tbody>
          {data.filter((item) => item.totalExpense !== null).map((item) => (
            <tr key={item.month}><td>{item.month}</td><td>{formatAmount(item.totalExpense ?? 0)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Expenses = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<ExpenseSummaryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const fetchExpenseSummary = useCallback(async () => {
    if (activeRequest.current) {
      return
    }

    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const response = await expenseService.getExpenseSummary(controller.signal)
      if (!response.success || !Array.isArray(response.data) || !response.data.every(isExpenseSummaryItem)) {
        throw new Error('Malformed expense summary response')
      }
      setSummary(response.data)
    } catch (requestError: unknown) {
      if (!axios.isCancel(requestError)) {
        setSummary([])
        setError(getSafeErrorMessage(requestError))
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchExpenseSummary()
    return () => {
      activeRequest.current?.abort()
      activeRequest.current = null
    }
  }, [fetchExpenseSummary])

  const chartData = useMemo<ChartItem[]>(() => {
    const returnedByMonth = new Map(summary.map((item) => [item.month, item.totalExpense]))
    return monthNames.map((month) => ({
      month,
      totalExpense: returnedByMonth.get(month) ?? null,
    }))
  }, [summary])

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#525256] lg:flex">
      <aside className="hidden w-[280px] shrink-0 bg-[#191919] px-7 py-10 text-white lg:flex lg:min-h-screen lg:flex-col">
        <NavLink to="/dashboard" className="mb-12 text-[25px] font-bold tracking-wide">
          FINE<span className="font-medium">bank.IO</span>
        </NavLink>
        <nav aria-label="Primary navigation" className="space-y-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex h-12 items-center gap-4 rounded px-4 text-[16px] transition-colors ${
                  isActive ? 'bg-[#299D91] font-semibold text-white' : 'text-[#B5B5B5] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span aria-hidden="true" className="w-5 text-center text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex h-12 items-center gap-4 rounded bg-white/[0.06] px-4 text-left font-semibold text-[#CFCFCF] hover:bg-white/10"
        >
          <span aria-hidden="true" className="text-xl">↪</span>
          Logout
        </button>
        <div className="mt-11 border-t border-white/10 pt-8">
          <p className="font-semibold text-white">{user?.fullName || user?.full_name || user?.username || 'Account'}</p>
          <p className="text-xs text-[#B5B5B5]">View profile</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[88px] items-center justify-between border-b border-[#E5E5E5] bg-[#F4F5F7] px-5 sm:px-8 lg:px-7">
          <p className="text-sm text-[#A5A5A5]"><span aria-hidden="true">»</span> {formattedDate}</p>
          <div className="flex items-center gap-5">
            <span aria-hidden="true" className="relative text-xl text-[#666]">♟<span className="absolute -right-1 top-0 h-2 w-2 rounded-full bg-[#299D91]" /></span>
            <div role="search" aria-label="Visual search field" className="hidden h-12 w-80 items-center justify-between rounded-2xl bg-white px-8 text-[#A5A5A5] shadow-sm sm:flex">
              <span>Search here</span><span aria-hidden="true" className="text-2xl text-[#555]">⌕</span>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 lg:px-6">
          <div className="mx-auto max-w-[1120px]">
            <h1 className="mb-6 text-2xl font-normal text-[#8D8D8D]">Expenses Comparison</h1>
            <section className="rounded-lg bg-white px-6 py-5 shadow-[0_18px_35px_rgba(0,0,0,0.08)] sm:px-7" aria-labelledby="monthly-comparison-heading">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <h2 id="monthly-comparison-heading" className="text-[17px] font-semibold text-[#252525]">Monthly Comparison</h2>
                {!isLoading && !error && summary.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#666]">
                    <span className="h-2.5 w-4 rounded-sm bg-[#299D91]" /> Current month
                    <span className="ml-3 h-2.5 w-4 rounded-sm bg-[#DADADA]" /> Other months
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="flex h-[340px] items-center justify-center" role="status">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[#DDEDEB] border-t-[#299D91]" />
                    <p className="text-sm text-[#888]">Loading expense summary…</p>
                  </div>
                </div>
              )}

              {!isLoading && error && (
                <div className="flex h-[340px] flex-col items-center justify-center text-center" role="alert">
                  <p className="max-w-md text-[#666]">{error}</p>
                  <button type="button" onClick={() => void fetchExpenseSummary()} className="mt-5 rounded bg-[#299D91] px-5 py-2.5 font-semibold text-white hover:bg-[#23897F] focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:ring-offset-2">
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && summary.length === 0 && (
                <div className="flex h-[340px] items-center justify-center text-center">
                  <div>
                    <p className="text-lg font-semibold text-[#555]">No expense summary data</p>
                    <p className="mt-2 text-sm text-[#999]">Monthly expense information will appear here when available.</p>
                  </div>
                </div>
              )}

              {!isLoading && !error && summary.length > 0 && <ExpenseSummaryChart data={chartData} />}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Expenses
