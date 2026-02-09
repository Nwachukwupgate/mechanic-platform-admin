import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { ArrowLeft, Mail, User, Car, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    adminAPI
      .getUser(id)
      .then((r) => setUser(r.data))
      .catch(() => toast.error('Failed to load user'))
  }, [id])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <Link to="/users" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User className="h-6 w-6" />
          {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name'}
        </h1>
        <p className="flex items-center gap-2 text-slate-600 mt-1">
          <Mail className="h-4 w-4" /> {user.email}
        </p>
        <p className="text-sm text-slate-500 mt-2">Joined {format(new Date(user.createdAt), 'PP')}</p>
        {user.profile && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
            <p>Phone: {user.profile.phone || '—'}</p>
            <p>Address: {user.profile.address || '—'}</p>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <h2 className="p-4 border-b border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Recent bookings
        </h2>
        <ul className="divide-y divide-slate-100">
          {user.bookings?.length === 0 && <li className="p-6 text-center text-slate-500">No bookings</li>}
          {user.bookings?.map((b: any) => (
            <li key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-800">{b.vehicle?.brand} {b.vehicle?.model} · {b.fault?.name}</p>
                  <p className="text-sm text-slate-500">{b.mechanic?.companyName ?? 'No mechanic'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">{b.status}</span>
                <Link to={`/bookings/${b.id}`} className="text-primary-600 text-sm font-medium hover:underline">View</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
