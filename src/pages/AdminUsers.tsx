import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ADMIN_PERMISSIONS } from '../store/authStore'
import { adminAPI, getApiErrorMessage } from '../services/api'
import TableLoader from '../components/TableLoader'
import Pagination from '../components/Pagination'

const LIMIT = 20

const AVAILABLE_PERMS = [
  ADMIN_PERMISSIONS.READ,
  ADMIN_PERMISSIONS.OVERVIEW,
  ADMIN_PERMISSIONS.USERS,
  ADMIN_PERMISSIONS.MECHANICS,
  ADMIN_PERMISSIONS.BOOKINGS,
  ADMIN_PERMISSIONS.PAYMENTS,
  ADMIN_PERMISSIONS.COMPLAINTS,
  ADMIN_PERMISSIONS.AUDIT,
  ADMIN_PERMISSIONS.ADMINS,
]

export default function AdminUsers() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [superadmin, setSuperadmin] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([ADMIN_PERMISSIONS.READ])

  const load = () => {
    setLoading(true)
    adminAPI
      .getAdminUsers({ page, limit: LIMIT })
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Failed to load admin users')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const togglePermission = (perm: string) => {
    setPermissions((current) => (current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm]))
  }

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await adminAPI.createAdminUser({
        email,
        password,
        superadmin,
        permissions: superadmin ? undefined : permissions,
      })
      toast.success('Admin user created')
      setEmail('')
      setPassword('')
      setSuperadmin(false)
      setPermissions([ADMIN_PERMISSIONS.READ])
      setPage(1)
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create admin user'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Users</h1>

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Create Admin</h2>
        <form onSubmit={createAdmin} className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              required
              minLength={8}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={superadmin}
              onChange={(e) => setSuperadmin(e.target.checked)}
            />
            Superadmin (full access)
          </label>

          {!superadmin && (
            <div>
              <p className="text-sm text-slate-600 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PERMS.map((perm) => (
                  <label key={perm} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm">
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Permissions</th>
                <th className="text-left p-4">Created</th>
              </tr>
            </thead>
            {loading ? (
              <TableLoader rows={8} cols={3} />
            ) : (
              <tbody className="divide-y divide-slate-100">
                {data?.items.map((a) => {
                  const perms = Array.isArray(a.adminPermissions) ? a.adminPermissions : []
                  return (
                    <tr key={a.id}>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{a.email}</div>
                        <div className="text-xs text-slate-500">{a.id}</div>
                      </td>
                      <td className="p-4">
                        {perms.length === 0 ? (
                          <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">superadmin</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {perms.map((p: string) => (
                              <span key={p} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
        {!loading && data?.items.length === 0 && <div className="p-10 text-center text-slate-500">No admin users found.</div>}
        {!loading && data && (
          <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={LIMIT} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
