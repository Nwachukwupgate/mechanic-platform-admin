import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  CreditCard,
  Flag,
  ScrollText,
  Banknote,
  Star,
  Bell,
  Tag,
  Shield,
  Webhook,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

const nav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/quotes', icon: Tag, label: 'Quotes' },
  { path: '/transactions', icon: CreditCard, label: 'Payments' },
  { path: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/mechanics', icon: Wrench, label: 'Mechanics' },
  { path: '/reports', icon: Flag, label: 'Reports' },
  { path: '/ratings', icon: Star, label: 'Ratings' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/payouts', icon: Banknote, label: 'Payouts' },
  { path: '/audit', icon: ScrollText, label: 'Audit log' },
  { path: '/admins', icon: Shield, label: 'Admins' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {mobileOpen ? (
        <button type="button" aria-label="Close menu" className="lg:hidden fixed inset-0 z-20 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
      ) : null}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-30 h-screen w-64 flex flex-col bg-slate-900 text-slate-200 shrink-0 transition-transform`}
      >
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-xs uppercase tracking-widest text-slate-500">Operations</p>
          <p className="font-bold text-white text-lg mt-1">Admin Console</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ path, icon: Icon, label, end }) => {
            const active = isActive(path, end)
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-800">Admin Console</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
