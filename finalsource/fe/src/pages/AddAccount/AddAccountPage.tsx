import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AddAccountForm from './AddAccountForm'

const navigation = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/accounts', label: 'Balances', icon: '▣' },
  { path: '/transactions', label: 'Transactions', icon: '↔' },
  { path: '/bills', label: 'Bills', icon: '▤' },
  { path: '/expenses', label: 'Expenses', icon: '◫' },
  { path: '/goals', label: 'Goals', icon: '◎' },
]

export default function AddAccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (navigationTimer.current) clearTimeout(navigationTimer.current)
  }, [])

  const handleSuccess = (message: string) => {
    setSuccessMessage(message)
    navigationTimer.current = setTimeout(() => navigate('/accounts'), 1500)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f6f7] font-['Inter',sans-serif] text-[#25272a] lg:flex">
      {successMessage && (
        <div role="status" className="fixed right-5 top-5 z-50 rounded-md bg-[#2fa79d] px-5 py-3 text-sm font-medium text-white shadow-lg">
          {successMessage}
        </div>
      )}

      <aside className="bg-[#1d1f20] text-white lg:fixed lg:inset-y-0 lg:flex lg:w-[244px] lg:flex-col lg:px-7 lg:pb-6 lg:pt-7">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-0 lg:py-0">
          <Link to="/dashboard" className="text-lg font-bold tracking-[0.02em]">FINEbank.IO</Link>
          <nav className="hidden gap-2 lg:mt-[34px] lg:flex lg:flex-col" aria-label="Primary navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={() =>
                  `flex h-11 items-center gap-3 rounded-[3px] px-3.5 text-sm ${
                    item.path === '/accounts' ? 'bg-[#2fa79d] text-white' : 'text-[#c1c4c8] hover:bg-white/10'
                  }`
                }
              >
                <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>{item.label}
              </NavLink>
            ))}
            <div className="flex h-11 items-center gap-3 rounded-[3px] px-3.5 text-sm text-[#c1c4c8]">
              <span aria-hidden="true" className="w-4 text-center">□</span>Settings
            </div>
          </nav>
        </div>
        <div className="hidden lg:mt-auto lg:block">
          <button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 rounded-[3px] bg-[#262829] px-3.5 text-sm text-[#d2d4d7]">
            <span aria-hidden="true">↪</span> Logout
          </button>
          <p className="mt-5 truncate text-xs text-white/60">{user?.fullName || user?.full_name || user?.username || 'Account user'}</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[244px]">
        <header className="flex min-h-[72px] items-center justify-between bg-white px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/accounts" className="font-medium text-[#25272a]">Accounts</Link>
            <span className="text-base text-[#8a8f98]">›</span>
            <span className="text-[#8a8f98]">Add Account</span>
          </div>
          <div className="hidden items-center gap-3.5 sm:flex">
            <div className="flex h-10 w-[260px] items-center justify-between rounded-[7px] bg-[#f0f2f3] px-3.5 text-[13px] text-[#a6aab0]">
              <span>Search here</span><span aria-hidden="true" className="text-lg text-[#25272a]">⌕</span>
            </div>
            <span aria-hidden="true" className="h-7 w-7 rounded-full bg-[#f0f2f3]" />
          </div>
        </header>

        <main className="px-5 pb-10 pt-8 sm:px-8 lg:px-[38px]">
          <div>
            <h1 className="text-[26px] font-bold leading-8">Add Bank Account</h1>
            <p className="mt-1.5 text-sm text-[#8a8f98]">Connect a bank account manually and enter its current balance.</p>
          </div>

          <section className="mt-[26px] w-full max-w-[804px] rounded-[7px] bg-white px-5 py-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] sm:px-[38px]">
            <h2 className="mb-6 text-lg font-medium">Account information</h2>
            <AddAccountForm onSuccess={handleSuccess} />
          </section>
        </main>
      </div>
    </div>
  )
}
