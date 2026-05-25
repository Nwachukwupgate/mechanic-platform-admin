import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { ArrowLeft, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react'
import { format } from 'date-fns'

const PAYMENT_PHASE_STEPS = [
  { key: 'inspection', label: 'Inspection fee' },
  { key: 'awaiting_repair_invoice', label: 'Repair quote' },
  { key: 'review_repair_invoice', label: 'Customer accept' },
  { key: 'repair_balance', label: 'Repair balance' },
  { key: 'complete', label: 'Complete' },
] as const

function phaseStepIndex(phase: string | undefined): number {
  if (!phase) return -1
  if (phase === 'standard') return 0
  const i = PAYMENT_PHASE_STEPS.findIndex((s) => s.key === phase)
  return i >= 0 ? i : -1
}

function settlementPhaseLabel(phase: string): string {
  switch (phase) {
    case 'INSPECTION':
      return 'Inspection payment'
    case 'REPAIR':
      return 'Repair balance payment'
    case 'FULL':
      return 'Full payment'
    default:
      return phase
  }
}

function txSettlementPhase(t: { metadata?: unknown }): string | null {
  const meta = t.metadata as { settlementPhase?: string } | null
  return meta?.settlementPhase ?? null
}

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [nextStatus, setNextStatus] = useState('')
  const [resolving, setResolving] = useState(false)

  const load = () => {
    if (!id) return
    adminAPI
      .getBooking(id)
      .then((r) => {
        setBooking(r.data)
        setDisputeReason(r.data.disputeReason || '')
        setNextStatus(r.data.status || '')
      })
      .catch(() => toast.error('Failed to load booking'))
  }

  useEffect(() => {
    load()
  }, [id])

  const updateStatus = async () => {
    if (!id || !nextStatus) return
    setResolving(true)
    try {
      const r = await adminAPI.setBookingStatus(id, nextStatus)
      setBooking(r.data)
      setNextStatus(r.data.status)
      toast.success('Booking status updated')
    } catch {
      toast.error('Failed to update booking status')
    } finally {
      setResolving(false)
    }
  }

  const openDispute = async () => {
    if (!id) return
    setResolving(true)
    try {
      await adminAPI.setBookingDispute(id, { disputeReason: disputeReason || undefined })
      toast.success('Dispute updated')
      load()
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
      load()
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
  const ps = booking.paymentSummary
  const isInspection = ps?.isInspectionFlow
  const currentStep = phaseStepIndex(ps?.phase)

  return (
    <div>
      <Link to="/bookings" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              {booking.vehicle?.brand} {booking.vehicle?.model} · {booking.fault?.name}
            </h1>
            <p className="text-slate-500 mt-1 font-mono text-xs break-all">{booking.id}</p>
            <p className="text-slate-600 mt-2">
              Job status: <span className="font-medium">{booking.status}</span>
            </p>
            {isInspection ? (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-100 text-violet-800">
                Inspection → repair flow
              </span>
            ) : null}
            {booking.paymentPhaseLabel ? (
              <p className="mt-2 text-sm text-violet-800 font-medium">{booking.paymentPhaseLabel}</p>
            ) : null}
          </div>
        </div>

        {isInspection && ps ? (
          <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-200">
            <h3 className="text-sm font-semibold text-violet-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment timeline
            </h3>
            <ol className="flex flex-wrap gap-2 mb-4">
              {PAYMENT_PHASE_STEPS.map((step, i) => {
                const done = currentStep > i || ps.phase === 'complete'
                const active = ps.phase === step.key
                return (
                  <li
                    key={step.key}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      active
                        ? 'bg-violet-600 text-white'
                        : done
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {step.label}
                  </li>
                )
              })}
            </ol>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-white border border-violet-100">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Inspection</p>
                {booking.inspectionPaidAt ? (
                  <>
                    <p className="font-semibold text-emerald-700 mt-1">
                      Paid ₦{Number(booking.inspectionPaidAmount ?? ps.inspectionPaidNaira).toLocaleString()}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {format(new Date(booking.inspectionPaidAt), 'PP')} · {booking.inspectionPaymentMethod ?? '—'}
                    </p>
                    {booking.inspectionPaystackReference ? (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{booking.inspectionPaystackReference}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="font-medium text-amber-700 mt-1">
                    Due ₦{Number(ps.inspectionFeeNaira).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-white border border-violet-100">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Repair total</p>
                {ps.repairTotalNaira != null ? (
                  <>
                    <p className="font-semibold text-slate-800 mt-1">
                      ₦{Number(ps.repairTotalNaira).toLocaleString()}
                    </p>
                    {!booking.paidAt ? (
                      <p className="text-violet-800 font-medium text-xs mt-1">
                        Balance due: ₦{Number(ps.balanceDueNaira).toLocaleString()}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-slate-500 mt-1">Not submitted yet</p>
                )}
              </div>
            </div>
            {booking.paidAt ? (
              <p className="text-sm text-emerald-800 mt-3 font-medium">
                Fully paid {format(new Date(booking.paidAt), 'PP')} · cumulative ₦
                {Number(booking.paidAmount ?? 0).toLocaleString()} · {booking.paymentMethod ?? '—'}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-600 space-y-1">
            {booking.estimatedCost != null && (
              <p>Estimated / agreed: ₦{Number(booking.estimatedCost).toLocaleString()}</p>
            )}
            {booking.paidAt && (
              <p>
                Paid {format(new Date(booking.paidAt), 'PP')} · ₦
                {Number(booking.paidAmount ?? booking.estimatedCost ?? 0).toLocaleString()} ·{' '}
                {booking.paymentMethod ?? '—'}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">User</h3>
            <p>
              {booking.user?.firstName} {booking.user?.lastName}
            </p>
            <p className="text-slate-600">{booking.user?.email}</p>
            <Link to={`/users/${booking.user?.id}`} className="text-primary-600 text-sm hover:underline">
              View user
            </Link>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Mechanic</h3>
            {booking.mechanic ? (
              <>
                <p>
                  {booking.mechanic.companyName} · {booking.mechanic.ownerFullName}
                </p>
                <p className="text-slate-600">{booking.mechanic.email}</p>
                <Link to={`/mechanics/${booking.mechanic.id}`} className="text-primary-600 text-sm hover:underline">
                  View mechanic
                </Link>
              </>
            ) : (
              <p className="text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-2">Admin controls</h3>
          <p className="text-xs text-slate-500 mb-3">
            Override job status or manage disputes. Payment phases are driven by customer/mechanic actions; use
            Transactions to reconcile Paystack payments.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'DELIVERED', 'EXPIRED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={updateStatus}
              disabled={resolving || nextStatus === booking.status}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {resolving ? 'Saving…' : 'Update status'}
            </button>
          </div>
        </div>
      </div>

      {Array.isArray(booking.quotes) && booking.quotes.length > 0 ? (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Quotes</h2>
          <ul className="space-y-2 text-sm">
            {booking.quotes.map((q: any) => (
              <li key={q.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="font-medium text-slate-800">
                  {q.mechanic?.companyName ?? 'Mechanic'} · {q.quoteType ?? 'STANDARD'} · {q.status}
                </p>
                <p className="text-slate-600 mt-0.5">
                  ₦{Number(q.customerTotalNaira ?? q.proposedPrice).toLocaleString()}
                  {q.id === booking.acceptedQuoteId ? ' · accepted' : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {Array.isArray(booking.invoices) && booking.invoices.length > 0 ? (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Invoices / repair quotes</h2>
          <ul className="space-y-2 text-sm">
            {booking.invoices.map((inv: any) => (
              <li key={inv.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="font-medium text-slate-800">
                  v{inv.version} · {inv.source} · {inv.status}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Parts ₦{Number(inv.partsNaira ?? 0).toLocaleString()} · Labour ₦
                  {Number(inv.labourNaira ?? 0).toLocaleString()} · Total ₦
                  {Number(inv.customerTotalNaira).toLocaleString()}
                </p>
                {inv.acceptedAt ? (
                  <p className="text-xs text-emerald-700 mt-1">
                    Accepted {format(new Date(inv.acceptedAt), 'PP')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {Array.isArray(booking.settlements) && booking.settlements.length > 0 ? (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Settlements (by payment phase)</h2>
          <div className="space-y-3">
            {booking.settlements.map((s: any) => (
              <div key={s.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm space-y-1">
                <p className="font-medium text-slate-800">{settlementPhaseLabel(s.phase)}</p>
                <p>Customer paid: ₦{Number(s.customerTotalNaira).toLocaleString()}</p>
                <p>
                  Parts ₦{Number(s.partsNaira).toLocaleString()} · Labour ₦
                  {Number(s.labourNaira).toLocaleString()}
                </p>
                <p>Platform fee: ₦{Number(s.platformFeeNaira).toLocaleString()}</p>
                <p>Mechanic earnings: ₦{Number(s.mechanicEarningsNaira).toLocaleString()}</p>
                <p className="text-xs text-slate-500">
                  {s.paymentMethod} · {format(new Date(s.createdAt), 'PP')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : booking.settlement ? (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Settlement</h2>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm space-y-1">
            <p>Customer total: ₦{Number(booking.settlement.customerTotalNaira).toLocaleString()}</p>
            <p>Platform fee: ₦{Number(booking.settlement.platformFeeNaira).toLocaleString()}</p>
            <p>Mechanic earnings: ₦{Number(booking.settlement.mechanicEarningsNaira).toLocaleString()}</p>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          {hasOpenDispute ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-slate-400" />
          )}
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
              <button
                type="button"
                onClick={openDispute}
                disabled={resolving}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50"
              >
                {resolving ? 'Saving…' : 'Save reason'}
              </button>
              {hasOpenDispute && (
                <button
                  type="button"
                  onClick={resolveDispute}
                  disabled={resolving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
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
            {booking.transactions.map((t: any) => {
              const phase = txSettlementPhase(t)
              return (
                <li key={t.id} className="p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="text-slate-800 font-medium">{String(t.type).replace(/_/g, ' ')}</span>
                      {phase ? (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-violet-100 text-violet-800">
                          {settlementPhaseLabel(phase)}
                        </span>
                      ) : null}
                      <p className="text-xs text-slate-500 mt-1 font-mono">{t.id}</p>
                    </div>
                    <span className="font-medium">
                      ₦{(t.amountMinor / 100).toLocaleString()} · {t.status}
                    </span>
                  </div>
                  <Link to={`/transactions/${t.id}`} className="text-primary-600 text-sm hover:underline mt-1 inline-block">
                    Open transaction →
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
