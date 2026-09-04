import { Link, NavLink, useNavigate } from 'react-router-dom'
import AddAccountForm from '../../components/AddAccountForm/AddAccountForm'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/accounts', label: 'Balances', icon: '▣' },
  { path: '/transactions', label: 'Transactions', icon: '↔' },
  { path: '/bills', label: 'Bills', icon: '▤' },
  { path: '/expenses', label: 'Expenses', icon: '◫' },
  { path: '/goals', label: 'Goals', icon: '◎' },
]

const AddAccountPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.fullName || user?.full_name || user?.username || 'Account user'

  return (
    <div className="min-h-screen bg-[#f5f6f7] font-['Inter',sans-serif] text-[#25272a] lg:flex">
      <aside className="flex bg-[#1d1f20] text-white lg:fixed lg:inset-y-0 lg:w-[244px] lg:flex-col lg:px-7 lg:py-7">
        <div className="flex w-full items-center justify-between gap-5 overflow-x-auto px-5 py-4 lg:flex-1 lg:flex-col lg:items-stretch lg:overflow-visible lg:px-0 lg:py-0">
          <Link to="/dashboard" className="min-w-max text-lg font-bold tracking-[0.02em]">FINEbank.IO</Link>
          <nav aria-label="Primary navigation" className="flex gap-2 lg:mt-7 lg:flex-col">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex h-11 min-w-max items-center gap-3 rounded-[3px] px-3.5 text-sm transition ${isActive ? 'bg-[#2fa79d] text-white' : 'text-[#c1c4c8] hover:bg-white/10 hover:text-white'}`}>
                <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </nav>
          <button type="button" onClick={handleLogout} className="hidden h-11 items-center gap-3 rounded-[3px] bg-[#262829] px-3.5 text-sm text-[#d2d4d7] hover:text-white lg:mt-auto lg:flex">
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[244px]">
        <header className="flex min-h-[72px] items-center justify-between gap-5 bg-white px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link to="/accounts" className="font-medium text-[#25272a]">Accounts</Link>
            <span aria-hidden="true" className="text-base text-[#8a8f98]">›</span>
            <span className="text-[#8a8f98]">Add Account</span>
          </nav>
          <div className="flex items-center gap-3.5">
            <div aria-label="Search" className="hidden h-10 w-[260px] items-center justify-between rounded-[7px] bg-[#f0f2f3] px-3.5 text-[13px] text-[#a6aab0] sm:flex">Search here <span aria-hidden="true" className="text-lg text-[#25272a]">⌕</span></div>
            <div title={displayName} aria-label={displayName} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2fa79d] text-xs font-semibold text-white">{displayName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <main className="px-6 pb-10 pt-8 lg:px-[38px]">
          <div className="mb-[26px]">
            <h1 className="text-[26px] font-bold leading-tight">Add Bank Account</h1>
            <p className="mt-1.5 text-sm text-[#8a8f98]">Connect a bank account manually and enter its current balance.</p>
          </div>
          <AddAccountForm />
        </main>
      </div>
    </div>
  )
}

export default AddAccountPage
