import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { FileText, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const statusOptions = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'DELIVERED']
const LIMIT = 20

export default function Bookings() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [userId, setUserId] = useState('')
  const [mechanicId, setMechanicId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [hasDispute, setHasDispute] = useState(searchParams.get('hasDispute') || '')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getBookings({
        page,
        limit: LIMIT,
        status: status || undefined,
        userId: userId || undefined,
        mechanicId: mechanicId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        hasDispute: hasDispute === 'true' ? true : hasDispute === 'false' ? false : undefined,
      })
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [page, status, userId, mechanicId, dateFrom, dateTo, hasDispute])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bookings</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={hasDispute} onChange={(e) => { setHasDispute(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All</option>
            <option value="true">Has dispute</option>
            <option value="false">No dispute</option>
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
                <th className="text-left p-4">Booking</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Mechanic</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Dispute</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            {loading ? (
          <TableLoader rows={10} cols={7} />
        ) : (
          <tbody className="divide-y divide-slate-100">
              {data?.items.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {b.vehicle?.brand} {b.vehicle?.model} · {b.fault?.name}
                    </span>
                    {b.estimatedCost != null && <p className="text-xs text-slate-500 mt-0.5">₦{Number(b.estimatedCost).toLocaleString()}</p>}
                  </td>
                  <td className="p-4 text-slate-600">{b.user?.email}</td>
                  <td className="p-4 text-slate-600">{b.mechanic?.companyName ?? '—'}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">{b.status}</span></td>
                  <td className="p-4">
                    {b.disputeReason && !b.disputeResolvedAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3" /> Open
                      </span>
                    ) : b.disputeResolvedAt ? <span className="text-xs text-slate-500">Resolved</span> : '—'}
                  </td>
                  <td className="p-4 text-slate-500">{format(new Date(b.createdAt), 'MMM d, yyyy')}</td>
                  <td className="p-4"><Link to={`/bookings/${b.id}`} className="text-primary-600 hover:underline font-medium">View</Link></td>
                </tr>
              ))}
            </tbody>
        )}
          </table>
        </div>
        {!loading && data?.items.length === 0 && <div className="p-12 text-center text-slate-500">No bookings found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
