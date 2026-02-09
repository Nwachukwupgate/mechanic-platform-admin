import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { ArrowLeft, Wrench, Mail, Banknote, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function MechanicDetail() {
  const { id } = useParams()
  const [mechanic, setMechanic] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    adminAPI
      .getMechanic(id)
      .then((r) => setMechanic(r.data))
      .catch(() => toast.error('Failed to load mechanic'))
  }, [id])

  const toggleVerify = async () => {
    if (!mechanic) return
    try {
      await adminAPI.setMechanicVerified(mechanic.id, !mechanic.isVerified)
      toast.success(mechanic.isVerified ? 'Unverified' : 'Verified')
      setMechanic((m: any) => ({ ...m, isVerified: !m.isVerified }))
    } catch {
      toast.error('Failed to update')
    }
  }

  if (!mechanic) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <Link to="/mechanics" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to mechanics
      </Link>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            {mechanic.profile?.avatar ? (
              <img src={mechanic.profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-slate-200" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <Wrench className="h-10 w-10 text-slate-500" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-800">{mechanic.companyName}</h1>
              <p className="text-slate-600 mt-0.5">{mechanic.ownerFullName}</p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-slate-500 mt-2"><Mail className="h-4 w-4" /> {mechanic.email}</p>
          <p className="text-sm text-slate-500 mt-2">Joined {format(new Date(mechanic.createdAt), 'PP')}</p>
          <button
            type="button"
            onClick={toggleVerify}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${mechanic.isVerified ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
          >
            {mechanic.isVerified ? 'Unverify' : 'Verify'} mechanic
          </button>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" /> Platform owes
          </h2>
          <p className="text-2xl font-bold text-emerald-600">₦{(mechanic.balance?.balanceNaira ?? 0).toLocaleString()}</p>
          <h2 className="font-semibold text-slate-800 mt-4 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" /> Mechanic owes platform
          </h2>
          <p className="text-2xl font-bold text-amber-600">₦{(mechanic.owing?.owingNaira ?? 0).toLocaleString()}</p>
          <Link to="/payouts" className="inline-block mt-4 text-primary-600 font-medium hover:underline">Manage payouts →</Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <h2 className="p-4 border-b border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Recent bookings
        </h2>
        <ul className="divide-y divide-slate-100">
          {mechanic.bookings?.length === 0 && <li className="p-6 text-center text-slate-500">No bookings</li>}
          {mechanic.bookings?.map((b: any) => (
            <li key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
              <div>
                <p className="font-medium text-slate-800">{b.vehicle?.brand} {b.vehicle?.model} · {b.fault?.name}</p>
                <p className="text-sm text-slate-500">{b.user?.firstName} {b.user?.lastName} · {b.user?.email}</p>
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
