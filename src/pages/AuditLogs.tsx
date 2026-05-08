import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { adminAPI, getApiErrorMessage } from '../services/api'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const LIMIT = 20

export default function AuditLogs() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    setLoading(true)
    adminAPI
      .getAuditLogs({
        page,
        limit: LIMIT,
        action: action || undefined,
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        adminId: adminId || undefined,
      })
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Failed to load audit logs')))
      .finally(() => setLoading(false))
  }, [page, action, entityType, entityId, adminId])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Audit Logs</h1>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
          <input
            value={action}
            onChange={(e) => {
              setAction(e.target.value)
              setPage(1)
            }}
            placeholder="Action contains..."
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value)
              setPage(1)
            }}
            placeholder="Entity type"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            value={entityId}
            onChange={(e) => {
              setEntityId(e.target.value)
              setPage(1)
            }}
            placeholder="Entity ID"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-64"
          />
          <input
            value={adminId}
            onChange={(e) => {
              setAdminId(e.target.value)
              setPage(1)
            }}
            placeholder="Admin ID"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Action</th>
                <th className="text-left p-4">Admin</th>
                <th className="text-left p-4">Entity</th>
                <th className="text-left p-4">Metadata</th>
              </tr>
            </thead>
            {loading ? (
              <TableLoader rows={10} cols={5} />
            ) : (
              <tbody className="divide-y divide-slate-100">
                {data?.items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 align-top">
                    <td className="p-4 text-slate-500 whitespace-nowrap">{format(new Date(row.createdAt), 'MMM d, yyyy HH:mm')}</td>
                    <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{row.action}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{row.admin?.email ?? row.adminId}</div>
                      <div className="text-xs text-slate-500">{row.adminId}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700">{row.entityType ?? '—'}</div>
                      <div className="text-xs text-slate-500 break-all">{row.entityId ?? '—'}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-xl">
                      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(row.metadata ?? {}, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!loading && data?.items.length === 0 && <div className="p-12 text-center text-slate-500">No audit logs found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
