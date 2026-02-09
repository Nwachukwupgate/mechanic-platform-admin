import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (!id) return
    adminAPI
      .getBooking(id)
      .then((r) => { setBooking(r.data); setDisputeReason(r.data.disputeReason || '') })
      .catch(() => toast.error('Failed to load booking'))
  }, [id])

  const openDispute = async () => {
    if (!id) return
    setResolving(true)
    try {
      await adminAPI.setBookingDispute(id, { disputeReason: disputeReason || undefined })
      toast.success('Dispute updated')
      setBooking((b: any) => ({ ...b, disputeReason: disputeReason || null, disputeResolvedAt: null }))
    } catch {
      toast.error('Failed to update')
    } finally {
      setResolving(false)
    }
  }

  const resolveDispute = async () => {
    if (!id) return
    setResolving(true)
    try {
      await adminAPI.setBookingDispute(id, { resolve: true })
      toast.success('Dispute resolved')
      setBooking((b: any) => ({ ...b, disputeResolvedAt: new Date().toISOString() }))
    } catch {
      toast.error('Failed to resolve')
    } finally {
      setResolving(false)
    }
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const hasOpenDispute = booking.disputeReason && !booking.disputeResolvedAt

  return (
    <div>
      <Link to="/bookings" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{booking.vehicle?.brand} {booking.vehicle?.model} · {booking.fault?.name}</h1>
            <p className="text-slate-500 mt-1">ID: {booking.id}</p>
            <p className="text-slate-600 mt-2">Status: <span className="font-medium">{booking.status}</span></p>
            {booking.estimatedCost != null && <p className="text-slate-600 mt-0.5">Estimated: ₦{Number(booking.estimatedCost).toLocaleString()}</p>}
            {booking.paidAt && <p className="text-slate-500 text-sm mt-1">Paid {format(new Date(booking.paidAt), 'PP')} · {booking.paymentMethod ?? '—'}</p>}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">User</h3>
            <p>{booking.user?.firstName} {booking.user?.lastName}</p>
            <p className="text-slate-600">{booking.user?.email}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Mechanic</h3>
            {booking.mechanic ? (
              <>
                <p>{booking.mechanic.companyName} · {booking.mechanic.ownerFullName}</p>
                <p className="text-slate-600">{booking.mechanic.email}</p>
                <Link to={`/mechanics/${booking.mechanic.id}`} className="text-primary-600 text-sm hover:underline">View mechanic</Link>
              </>
            ) : (
              <p className="text-slate-500">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Dispute section */}
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          {hasOpenDispute ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-slate-400" />}
          Dispute
        </h2>
        {booking.disputeResolvedAt ? (
          <p className="text-slate-500 text-sm">Resolved on {format(new Date(booking.disputeResolvedAt), 'PP')}</p>
        ) : (
          <>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Dispute reason (set by user/mechanic or admin)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3"
            />
            <div className="flex gap-2">
              <button type="button" onClick={openDispute} disabled={resolving} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50">
                {resolving ? 'Saving…' : 'Save reason'}
              </button>
              {hasOpenDispute && (
                <button type="button" onClick={resolveDispute} disabled={resolving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  Mark resolved
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {booking.transactions?.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <h2 className="p-4 border-b border-slate-100 font-semibold text-slate-800">Transactions</h2>
          <ul className="divide-y divide-slate-100">
            {booking.transactions.map((t: any) => (
              <li key={t.id} className="p-4 flex justify-between">
                <span className="text-slate-600">{t.type}</span>
                <span className="font-medium">₦{(t.amountMinor / 100).toLocaleString()} · {t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
