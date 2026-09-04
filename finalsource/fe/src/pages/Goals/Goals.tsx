import React, { useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { goalService } from '../../api/goal.service'
import type {
  ExpenseGoalListItem,
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

const expenseCards = [
  { label: 'Housing', icon: '⌂' },
  { label: 'Transportation', icon: '▦' },
  { label: 'Entertainment', icon: '▰' },
  { label: 'Shopping', icon: '▢' },
  { label: 'Others', icon: '▦' },
] as const

interface ExpenseGoalCard {
  readonly label: string
  readonly icon: string
  readonly goal?: UpdatedGoal
}

const Goals: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [adjustingGoal, setAdjustingGoal] = useState<UpdatedGoal | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [savingGoal, setSavingGoal] = useState<SavingGoalListItem | null>(null)
  const [expenseGoals, setExpenseGoals] = useState<ExpenseGoalListItem[]>([])

  const refreshGoals = useCallback(async (): Promise<void> => {
    try {
      const response = await goalService.getGoals()
      if (response.success && response.data) {
        setSavingGoal(response.data.savingGoal)
        setExpenseGoals(response.data.expenseGoals)
      }
    } catch {
      // The create result stays visible if the existing list endpoint is unavailable.
    }
  }, [])

  useEffect(() => {
    void refreshGoals()
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

  const expenseGoalCards: ExpenseGoalCard[] = expenseGoals.length > 0
    ? expenseGoals.map((goal, index) => ({
        label: goal.category,
        icon: expenseCards[index % expenseCards.length].icon,
        goal: { goal_id: goal.goal_id, target_amount: goal.target_amount },
      }))
    : expenseCards.map((card) => card)
  const formatVnd = (amount: number): string => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)} VND`

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account User'
  const topDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())

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

          <div className="mt-2 grid gap-6 xl:grid-cols-[368px_minmax(0,1fr)]">
            <article className="rounded-xl bg-white px-6 py-6 shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between border-b border-[#ececec] pb-5"><h2 className="font-semibold text-[#4d4d4d]">Savings Goal</h2><button type="button" disabled className="rounded border border-[#d7d7d7] bg-[#f6f6f6] px-4 py-2 text-xs text-[#777]">01 May ~ 31 May⌄</button></div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-5 text-sm text-[#888]"><div><p>♕ &nbsp;Target Achieved</p><p className="ml-6 mt-1 text-lg font-bold text-[#222]">$12,500</p></div><div><p>◎ &nbsp;This month Target</p><p className="ml-6 mt-1 text-lg font-bold text-[#222]">{savingGoal ? formatVnd(savingGoal.target_amount) : '$20,000'}</p></div></div>
                <div className="flex flex-col items-center justify-center"><div className="relative h-24 w-32 overflow-hidden"><div className="absolute left-2 top-3 h-24 w-28 rotate-[-40deg] rounded-full border-[12px] border-[#e3e7e7] border-r-[#299D91] border-t-[#299D91]" /><div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#299D91]" /></div><p className="text-xs font-semibold">Target vs Achievement</p></div>
              </div>
              <button type="button" disabled={!savingGoal || Boolean(adjustingGoal)} onClick={() => { if (savingGoal) { setSuccessMessage(''); setAdjustingGoal({ goal_id: savingGoal.goal_id, target_amount: savingGoal.target_amount }) } }} className="mt-6 w-full rounded border border-[#299D91] py-2 text-sm text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:cursor-not-allowed disabled:opacity-50">Adjust Goal &nbsp;✎</button>
            </article>

            <SavingsSummaryChart />
          </div>

          <section className="mt-7">
            <h2 className="text-2xl font-normal text-[#777]">Expenses Goals by Category</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {expenseGoalCards.map(({ goal, icon, label }) => {
                return <article key={goal?.goal_id ?? label} className="flex items-center gap-4 rounded-xl bg-white px-6 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.07)]"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f0f1f1] text-xl text-[#555]">{icon}</div><div className="min-w-0 flex-1"><p className="text-sm text-[#8a8a8a]">{label}</p><p className="text-xl font-bold text-[#242424]">{goal ? formatVnd(goal.target_amount) : '$250.00'}</p></div><button type="button" disabled={!goal || Boolean(adjustingGoal)} onClick={() => { if (goal) { setSuccessMessage(''); setAdjustingGoal(goal) } }} className="rounded border border-[#299D91] px-4 py-2 text-sm text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:cursor-not-allowed disabled:opacity-50">Adjust &nbsp;✎</button></article>
              })}
            </div>
          </section>
          <p className="sr-only" aria-live="polite">{(savingGoal ? 1 : 0) + expenseGoals.length} goals loaded.</p>
        </section>
      </main>

      {createOpen && <CreateGoalModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}
      {adjustingGoal && <AdjustGoalModal goal={adjustingGoal} onClose={() => setAdjustingGoal(null)} onUpdated={handleUpdated} />}
    </div>
  )
}

export default Goals
