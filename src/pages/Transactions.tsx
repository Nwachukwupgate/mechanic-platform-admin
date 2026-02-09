import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const typeLabels: Record<string, string> = {
  USER_PAYMENT: 'User payment',
  PLATFORM_PAYOUT: 'Payout',
  MECHANIC_FEE: 'Mechanic fee',
  REFUND: 'Refund',
}

const LIMIT = 20

export default function Transactions() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [userId, setUserId] = useState('')
  const [mechanicId, setMechanicId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getTransactions({
        page,
        limit: LIMIT,
        type: type || undefined,
        status: status || undefined,
        userId: userId || undefined,
        mechanicId: mechanicId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [page, type, status, userId, mechanicId, dateFrom, dateTo])

  const tableBody = loading ? (
    <TableLoader rows={10} cols={5} />
  ) : (
    <tbody className="divide-y divide-slate-100">
      {data?.items.map((t) => (
        <tr key={t.id} className="hover:bg-slate-50/50">
          <td className="p-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-400" />
            {typeLabels[t.type] || t.type}
          </td>
          <td className="p-4 font-medium">₦{(t.amountNaira ?? t.amountMinor / 100).toLocaleString()}</td>
          <td className="p-4"><span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">{t.status}</span></td>
          <td className="p-4 text-slate-600">{t.user?.email ?? t.mechanic?.companyName ?? '—'}</td>
          <td className="p-4 text-slate-500">{format(new Date(t.createdAt), 'MMM d, yyyy HH:mm')}</td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Transactions</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All types</option>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
          <input type="text" placeholder="User ID" value={userId} onChange={(e) => { setUserId(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-40" />
          <input type="text" placeholder="Mechanic ID" value={mechanicId} onChange={(e) => { setMechanicId(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-40" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">User / Mechanic</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            {tableBody}
          </table>
        </div>
        {!loading && data?.items.length === 0 && <div className="p-12 text-center text-slate-500">No transactions found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
