import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { adminAPI, getApiErrorMessage } from '../services/api'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const LIMIT = 20

export default function Reports() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [resolved, setResolved] = useState('')
  const [reporterRole, setReporterRole] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getReports({
        page,
        limit: LIMIT,
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        reporterRole: reporterRole || undefined,
        bookingId: bookingId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Failed to load complaints')))
      .finally(() => setLoading(false))
  }, [page, resolved, reporterRole, bookingId, dateFrom, dateTo])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Complaints & Reports</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
          <select value={resolved} onChange={(e) => { setResolved(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All statuses</option>
            <option value="false">Open</option>
            <option value="true">Resolved</option>
          </select>
          <select value={reporterRole} onChange={(e) => { setReporterRole(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="">All reporters</option>
            <option value="USER">User</option>
            <option value="MECHANIC">Mechanic</option>
          </select>
          <input type="text" placeholder="Booking ID" value={bookingId} onChange={(e) => { setBookingId(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-48" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Complaint</th>
                <th className="text-left p-4">Reporter</th>
                <th className="text-left p-4">Booking</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            {loading ? (
              <TableLoader rows={10} cols={6} />
            ) : (
              <tbody className="divide-y divide-slate-100">
                {data?.items.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {r.reason}
                      </span>
                      {r.details && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.details}</p>}
                    </td>
                    <td className="p-4 text-slate-600">{r.reporterRole}</td>
                    <td className="p-4 text-slate-600">{r.bookingId}</td>
                    <td className="p-4">
                      {r.booking?.disputeResolvedAt ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Resolved</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Open</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{format(new Date(r.createdAt), 'MMM d, yyyy HH:mm')}</td>
                    <td className="p-4">
                      <Link to={`/reports/${r.id}`} className="text-primary-600 hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        {!loading && data?.items.length === 0 && <div className="p-12 text-center text-slate-500">No complaints found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
