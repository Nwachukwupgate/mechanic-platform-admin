import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  CreditCard,
  Banknote,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/mechanics', icon: Wrench, label: 'Mechanics' },
  { path: '/bookings', icon: FileText, label: 'Bookings' },
  { path: '/transactions', icon: CreditCard, label: 'Transactions' },
  { path: '/payouts', icon: Banknote, label: 'Payouts' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-18'
        } bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <Link to="/" className="font-bold text-lg truncate">
            {sidebarOpen ? 'Mechanic Admin' : 'MA'}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(path) ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && isActive(path) && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <div className={`px-3 py-2 text-slate-400 text-sm truncate ${!sidebarOpen ? 'hidden' : ''}`}>
            {user?.email}
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
