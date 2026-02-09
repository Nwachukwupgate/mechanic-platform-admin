import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { Users, Wrench, FileText, DollarSign, AlertTriangle, CreditCard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'

const typeLabels: Record<string, string> = {
  USER_PAYMENT: 'User payment',
  PLATFORM_PAYOUT: 'Payout',
  MECHANIC_FEE: 'Mechanic fee',
  REFUND: 'Refund',
}

const STATUS_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1', '#14b8a6']

export default function Dashboard() {
  const [stats, setStats] = useState<{
    usersCount?: number
    mechanicsCount?: number
    verifiedMechanics?: number
    bookingsCount?: number
    revenueNaira?: number
    disputedCount?: number
    bookingsByStatus?: Record<string, number>
  } | null>(null)
  const [latestTx, setLatestTx] = useState<any[]>([])
  const [loadingTx, setLoadingTx] = useState(true)

  useEffect(() => {
    adminAPI
      .getStats()
      .then((r) => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
  }, [])

  useEffect(() => {
    adminAPI
      .getTransactions({ limit: 10, page: 1 })
      .then((r) => {
        setLatestTx(r.data?.items ?? [])
      })
      .catch(() => setLatestTx([]))
      .finally(() => setLoadingTx(false))
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const cards = [
    { label: 'Users', value: stats.usersCount ?? 0, icon: Users, href: '/users', color: 'bg-blue-500' },
    { label: 'Mechanics', value: stats.mechanicsCount ?? 0, sub: `${stats.verifiedMechanics ?? 0} verified`, icon: Wrench, href: '/mechanics', color: 'bg-emerald-500' },
    { label: 'Bookings', value: stats.bookingsCount ?? 0, icon: FileText, href: '/bookings', color: 'bg-violet-500' },
    { label: 'Revenue (₦)', value: (stats.revenueNaira ?? 0).toLocaleString(), icon: DollarSign, href: '/transactions', color: 'bg-amber-500' },
    { label: 'Open Disputes', value: stats.disputedCount ?? 0, icon: AlertTriangle, href: '/bookings?hasDispute=true', color: 'bg-red-500' },
  ]

  const bookingChartData = stats.bookingsByStatus
    ? Object.entries(stats.bookingsByStatus).map(([name, count]) => ({ name: name.replace('_', ' '), count }))
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={label}
            to={href}
            className="bg-white rounded-xl shadow border border-slate-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
              </div>
              <div className={`p-3 rounded-xl ${color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {bookingChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Bookings by status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {bookingChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Bookings distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingChartData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Latest transactions
          </h2>
          <Link to="/transactions" className="text-sm font-medium text-primary-600 hover:underline">
            View all →
          </Link>
        </div>
        {loadingTx ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Party</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestTx.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
                {latestTx.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-4">{typeLabels[t.type] || t.type}</td>
                    <td className="p-4 font-medium">₦{(t.amountNaira ?? t.amountMinor / 100).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">{t.status}</span>
                    </td>
                    <td className="p-4 text-slate-600">{t.user?.email ?? t.mechanic?.companyName ?? '—'}</td>
                    <td className="p-4 text-slate-500">{format(new Date(t.createdAt), 'MMM d, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
