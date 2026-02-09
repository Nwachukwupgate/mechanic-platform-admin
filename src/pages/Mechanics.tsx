import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { Search, Wrench, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const LIMIT = 20

export default function Mechanics() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isVerified, setIsVerified] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getMechanics({ page, limit: LIMIT, search: search || undefined, isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined })
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load mechanics'))
      .finally(() => setLoading(false))
  }, [page, search, isVerified])

  const toggleVerify = async (id: string, current: boolean) => {
    try {
      await adminAPI.setMechanicVerified(id, !current)
      toast.success(current ? 'Mechanic unverified' : 'Mechanic verified')
      setData((d) => d ? { ...d, items: d.items.map((m) => (m.id === id ? { ...m, isVerified: !current } : m)) } : null)
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mechanics</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={isVerified}
            onChange={(e) => { setIsVerified(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Company / Owner</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Verified</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            {loading ? (
          <TableLoader rows={10} cols={5} />
        ) : (
          <tbody className="divide-y divide-slate-100">
              {data?.items.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="flex items-center gap-3 font-medium text-slate-800">
                      {m.profile?.avatar ? (
                        <img src={m.profile.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <Wrench className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                      {m.companyName} · {m.ownerFullName}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{m.email}</td>
                  <td className="p-4">
                    {m.isVerified ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-slate-300" />}
                  </td>
                  <td className="p-4 text-slate-500">{format(new Date(m.createdAt), 'MMM d, yyyy')}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVerify(m.id, m.isVerified)}
                      className={`px-2 py-1 rounded text-xs font-medium ${m.isVerified ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      {m.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <Link to={`/mechanics/${m.id}`} className="text-primary-600 hover:underline font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
        )}
          </table>
        </div>
        {!loading && data?.items.length === 0 && <div className="p-12 text-center text-slate-500">No mechanics found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
