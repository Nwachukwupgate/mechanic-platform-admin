import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { Search, Mail, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const LIMIT = 20

export default function Users() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [emailVerified, setEmailVerified] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getUsers({ page, limit: LIMIT, search: search || undefined, emailVerified: emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined })
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [page, search, emailVerified])

  const tableBody = loading ? (
    <TableLoader rows={10} />
  ) : (
    <tbody className="divide-y divide-slate-100">
      {data?.items.map((u) => (
        <tr key={u.id} className="hover:bg-slate-50/50">
          <td className="p-4">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              {u.email}
            </span>
          </td>
          <td className="p-4">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
          <td className="p-4">
            {u.emailVerified ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-slate-300" />}
          </td>
          <td className="p-4 text-slate-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
          <td className="p-4">
            <Link to={`/users/${u.id}`} className="text-primary-600 hover:underline font-medium">View</Link>
          </td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={emailVerified}
            onChange={(e) => { setEmailVerified(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All verification</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Verified</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            {tableBody}
          </table>
        </div>
        {!loading && data?.items.length === 0 && (
          <div className="p-12 text-center text-slate-500">No users found.</div>
        )}
        {!loading && data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
