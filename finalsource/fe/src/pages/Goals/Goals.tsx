import axios from 'axios'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { goalService } from '../../api/goal.service'
import type {
  ExpenseGoalListItem,
  GoalListResult,
  SavingGoalListItem,
  UpdatedGoal,
} from '../../api/types'
import AdjustGoalModal from '../../components/Goals/AdjustGoalModal'
import CreateGoalModal from '../../components/Goals/CreateGoalModal'
import SavingsSummaryChart from '../../components/Goals/SavingsSummaryChart'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: '◇' },
  { label: 'Balances', path: '/account', icon: '▣' },
  { label: 'Transactions', path: '/transactions', icon: '⇄' },
  { label: 'Bills', path: '/bills', icon: '▤' },
  { label: 'Expenses', path: '/expenses', icon: '▧' },
  { label: 'Goals', path: '/goals', icon: '◉' },
] as const

const expenseIcons = ['⌂', '▦', '▰', '▢', '▦'] as const

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

const isSavingGoal = (value: unknown): value is SavingGoalListItem => {
  if (!isRecord(value)) return false
  return isFiniteNumber(value.goal_id)
    && value.goal_type === 'Saving'
    && isFiniteNumber(value.target_amount)
    && isFiniteNumber(value.target_achieved)
    && typeof value.start_date === 'string'
    && typeof value.end_date === 'string'
}

const isExpenseGoal = (value: unknown): value is ExpenseGoalListItem => {
  if (!isRecord(value)) return false
  return isFiniteNumber(value.goal_id)
    && typeof value.category === 'string'
    && isFiniteNumber(value.target_amount)
    && isFiniteNumber(value.current_expense)
}

const isGoalListResult = (value: unknown): value is GoalListResult => {
  if (!isRecord(value) || !Array.isArray(value.expenseGoals)) return false
  return (value.savingGoal === null || isSavingGoal(value.savingGoal))
    && value.expenseGoals.every(isExpenseGoal)
}

const getSafeErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'Unable to load goals. Please try again.'
  const responseData: unknown = error.response?.data
  if (isRecord(responseData)) {
    const message = responseData.message
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(', ')
    }
  }
  return 'Unable to load goals. Please try again.'
}

const formatAmount = (amount: number): string => (
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)} VND`
)

const Goals: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const activeRequest = useRef<AbortController | null>(null)
  const latestRequestId = useRef(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [adjustingGoal, setAdjustingGoal] = useState<UpdatedGoal | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [savingGoal, setSavingGoal] = useState<SavingGoalListItem | null>(null)
  const [expenseGoals, setExpenseGoals] = useState<ExpenseGoalListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshGoals = useCallback(async (): Promise<void> => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    const requestId = latestRequestId.current + 1
    activeRequest.current = controller
    latestRequestId.current = requestId
    setIsLoading(true)
    setLoadError(null)

    try {
      const response = await goalService.getGoals(controller.signal)
      if (requestId !== latestRequestId.current) return
      if (!response.success || !isGoalListResult(response.data)) {
        throw new Error('Malformed goal response')
      }
      setSavingGoal(response.data.savingGoal)
      setExpenseGoals(response.data.expenseGoals)
    } catch (error: unknown) {
      if (controller.signal.aborted || requestId !== latestRequestId.current) return
      setSavingGoal(null)
      setExpenseGoals([])
      if (axios.isAxiosError(error) && error.response?.status === 401) return
      setLoadError(getSafeErrorMessage(error))
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshGoals()
    return () => {
      activeRequest.current?.abort()
      latestRequestId.current += 1
    }
  }, [refreshGoals])

  const handleCreated = (message: string, goalId: number): void => {
    setCreateOpen(false)
    setSuccessMessage(`${message} (#${goalId})`)
    void refreshGoals()
  }

  const handleUpdated = (message: string, goalId: number, targetAmount: number): void => {
    setSavingGoal((current) => current?.goal_id === goalId
      ? { ...current, target_amount: targetAmount }
      : current)
    setExpenseGoals((current) => current.map((goal) => (
      goal.goal_id === goalId ? { ...goal, target_amount: targetAmount } : goal
    )))
    setAdjustingGoal(null)
    setSuccessMessage(message)
    void refreshGoals()
  }

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account User'
  const topDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
  const hasGoals = savingGoal !== null || expenseGoals.length > 0
  const progressPercent = savingGoal && savingGoal.target_amount > 0
    ? Math.max(0, Math.min(100, (savingGoal.target_achieved / savingGoal.target_amount) * 100))
    : 0

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#252525] lg:flex">
      <aside className="flex bg-[#191919] text-[#bdbdbd] lg:min-h-screen lg:w-[280px] lg:flex-col">
        <div className="flex w-full items-center gap-5 overflow-x-auto px-5 py-4 lg:flex lg:flex-col lg:items-stretch lg:overflow-visible lg:px-7 lg:py-12">
          <div className="mr-4 shrink-0 text-2xl font-bold tracking-[0.06em] text-white lg:mb-8 lg:px-7">FINE<span className="font-medium">bank.IO</span></div>
          <nav aria-label="Primary" className="flex gap-2 lg:block lg:space-y-4">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex min-w-max items-center gap-4 rounded px-4 py-3 text-sm font-medium transition-colors lg:w-full ${isActive ? 'bg-[#299D91] text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                <span aria-hidden="true" className="w-5 text-center text-xl">{item.icon}</span>{item.label}
              </NavLink>
            ))}
            <button type="button" disabled className="flex min-w-max cursor-default items-center gap-4 rounded px-4 py-3 text-sm font-medium lg:w-full"><span aria-hidden="true" className="w-5 text-center text-xl">⚙</span>Settings</button>
          </nav>
          <div className="hidden lg:mt-auto lg:block lg:pt-32">
            <button type="button" onClick={() => { logout(); navigate('/login') }} className="flex w-full items-center gap-4 rounded bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10"><span aria-hidden="true" className="text-xl">↪</span> Logout</button>
            <div className="mt-11 border-t border-white/10 pt-8"><p className="truncate text-sm font-semibold text-white">{displayName}</p><p className="text-xs">View profile</p></div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[88px] items-center justify-between border-b border-black/5 px-6 lg:px-7">
          <div className="flex items-center gap-2 text-sm text-[#9d9d9d]"><span aria-hidden="true" className="text-2xl">»</span>{topDate}</div>
          <div className="flex items-center gap-7">
            <button type="button" disabled aria-label="Notifications" className="relative cursor-default text-xl text-[#555]">●<span className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-[#299D91]" /></button>
            <label className="hidden h-12 w-[352px] items-center rounded-xl bg-white px-8 shadow-[0_12px_32px_rgba(0,0,0,0.05)] sm:flex"><span className="sr-only">Search</span><input readOnly placeholder="Search here" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><span aria-hidden="true" className="text-2xl">⌕</span></label>
          </div>
        </header>

        <section className="px-6 pb-10 pt-5 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-normal text-[#777]">Goals</h1>
            <button type="button" onClick={() => { setSuccessMessage(''); setCreateOpen(true) }} className="rounded bg-[#299D91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#23877d] focus:outline-none focus:ring-2 focus:ring-[#299D91]/40">+ Create Goal</button>
          </div>
          <div aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold text-[#23877d]">{successMessage}</div>

          {isLoading && (
            <div role="status" aria-label="Loading goals" className="mt-2 grid animate-pulse gap-6 xl:grid-cols-[368px_minmax(0,1fr)]">
              <div className="h-[292px] rounded-xl bg-white shadow-[0_14px_34px_rgba(0,0,0,0.08)]" />
              <div className="h-[292px] rounded-xl bg-white shadow-[0_14px_34px_rgba(0,0,0,0.08)]" />
              <span className="sr-only">Loading financial goals</span>
            </div>
          )}

          {!isLoading && loadError && (
            <div role="alert" className="mt-2 rounded-xl bg-white px-8 py-12 text-center shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
              <h2 className="text-lg font-semibold text-[#4d4d4d]">Goals could not be loaded</h2>
              <p className="mt-2 text-sm text-[#777]">{loadError}</p>
              <button type="button" onClick={() => void refreshGoals()} disabled={isLoading} className="mt-6 rounded border border-[#299D91] px-5 py-2 text-sm font-semibold text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:opacity-50">Retry</button>
            </div>
          )}

          {!isLoading && !loadError && (
            <>
              {!hasGoals && (
                <div className="mt-2 rounded-xl bg-white px-8 py-12 text-center shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
                  <h2 className="text-lg font-semibold text-[#4d4d4d]">No financial goals yet</h2>
                  <p className="mt-2 text-sm text-[#777]">Create a goal to start tracking your progress.</p>
                  <button type="button" onClick={() => setCreateOpen(true)} className="mt-6 rounded border border-[#299D91] px-5 py-2 text-sm font-semibold text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30">Create Goal</button>
                </div>
              )}

              <div className="mt-2 grid gap-6 xl:grid-cols-[368px_minmax(0,1fr)]">
                {savingGoal && (
                  <article className="rounded-xl bg-white px-6 py-6 shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-3 border-b border-[#ececec] pb-5">
                      <h2 className="font-semibold text-[#4d4d4d]">Savings Goal</h2>
                      <span className="rounded border border-[#d7d7d7] bg-[#f6f6f6] px-3 py-2 text-xs text-[#777]">{savingGoal.start_date} – {savingGoal.end_date}</span>
                    </div>
                    <div className="mt-6 space-y-5 text-sm text-[#888]">
                      <div><p>♕ &nbsp;Target Achieved</p><p className="ml-6 mt-1 text-lg font-bold text-[#222]">{formatAmount(savingGoal.target_achieved)}</p></div>
                      <div><p>◎ &nbsp;Target Amount</p><p className="ml-6 mt-1 text-lg font-bold text-[#222]">{formatAmount(savingGoal.target_amount)}</p></div>
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[#555]"><span>Target vs Achievement</span><span>{progressPercent.toFixed(0)}%</span></div>
                        <progress aria-label="Saving goal progress" className="mt-2 h-3 w-full accent-[#299D91]" max={100} value={progressPercent} />
                      </div>
                    </div>
                    <button type="button" disabled={Boolean(adjustingGoal)} onClick={() => { setSuccessMessage(''); setAdjustingGoal({ goal_id: savingGoal.goal_id, target_amount: savingGoal.target_amount }) }} className="mt-6 w-full rounded border border-[#299D91] py-2 text-sm text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:cursor-not-allowed disabled:opacity-50">Adjust Goal &nbsp;✎</button>
                  </article>
                )}

                <SavingsSummaryChart />
              </div>

              {expenseGoals.length > 0 && (
                <section className="mt-7">
                  <h2 className="text-2xl font-normal text-[#777]">Expenses Goals by Category</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {expenseGoals.map((goal, index) => (
                      <article key={goal.goal_id} className="rounded-xl bg-white px-6 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.07)]">
                        <div className="flex items-center gap-4">
                          <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f0f1f1] text-xl text-[#555]">{expenseIcons[index % expenseIcons.length]}</div>
                          <div className="min-w-0 flex-1"><p className="truncate text-sm text-[#8a8a8a]">{goal.category}</p><p className="text-xl font-bold text-[#242424]">{formatAmount(goal.target_amount)}</p></div>
                          <button type="button" disabled={Boolean(adjustingGoal)} onClick={() => { setSuccessMessage(''); setAdjustingGoal({ goal_id: goal.goal_id, target_amount: goal.target_amount }) }} className="rounded border border-[#299D91] px-4 py-2 text-sm text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:cursor-not-allowed disabled:opacity-50">Adjust &nbsp;✎</button>
                        </div>
                        <div className="mt-4 border-t border-[#ececec] pt-3 text-xs text-[#777]"><span className="font-semibold text-[#4d4d4d]">Current expense:</span> {formatAmount(goal.current_expense)}</div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              <p className="sr-only" aria-live="polite">{(savingGoal ? 1 : 0) + expenseGoals.length} goals loaded.</p>
            </>
          )}
        </section>
      </main>

      {createOpen && <CreateGoalModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}
      {adjustingGoal && <AdjustGoalModal goal={adjustingGoal} onClose={() => setAdjustingGoal(null)} onUpdated={handleUpdated} />}
    </div>
  )
}

export default Goals
