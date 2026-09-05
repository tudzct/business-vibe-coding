import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { billService } from '../../api/bill.service'
import type { UpcomingBill } from '../../api/types'
import UpcomingBills from '../../components/UpcomingBills/UpcomingBills'
import { useAuth } from '../../hooks/useAuth'

const navigationItems = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/accounts', label: 'Balances', icon: '▣' },
  { path: '/transactions', label: 'Transactions', icon: '⇄' },
  { path: '/bills', label: 'Bills', icon: '▧' },
  { path: '/expenses', label: 'Expenses', icon: '▤' },
  { path: '/goals', label: 'Goals', icon: '◉' },
] as const

const isUpcomingBill = (value: unknown): value is UpcomingBill => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const bill = value as Record<string, unknown>
  return (
    typeof bill.billId === 'number' &&
    Number.isFinite(bill.billId) &&
    typeof bill.userId === 'number' &&
    Number.isFinite(bill.userId) &&
    typeof bill.itemDescription === 'string' &&
    (bill.logoUrl === null || typeof bill.logoUrl === 'string') &&
    typeof bill.dueDate === 'string' &&
    (bill.lastChargeDate === null || typeof bill.lastChargeDate === 'string') &&
    typeof bill.amount === 'number' &&
    Number.isFinite(bill.amount)
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
  return 'Unable to load bills. Please try again.'
}

const Bills = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bills, setBills] = useState<UpcomingBill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const fetchUpcomingBills = useCallback(async () => {
    if (activeRequest.current) {
      return
    }

    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const response = await billService.getUpcomingBills(controller.signal)
      if (!response.success || !Array.isArray(response.data) || !response.data.every(isUpcomingBill)) {
        throw new Error('Malformed upcoming bills response')
      }
      setBills(response.data)
    } catch (requestError: unknown) {
      if (!axios.isCancel(requestError)) {
        setBills([])
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
    void fetchUpcomingBills()
    return () => {
      activeRequest.current?.abort()
      activeRequest.current = null
    }
  }, [fetchUpcomingBills])

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
            <UpcomingBills
              bills={bills}
              isLoading={isLoading}
              error={error}
              onRetry={() => void fetchUpcomingBills()}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Bills
