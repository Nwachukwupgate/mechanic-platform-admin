import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { adminAPI, getApiErrorMessage } from '../services/api'
import { ADMIN_PERMISSIONS, hasAdminPermission, useAuthStore } from '../store/authStore'
import ConfirmModal from '../components/ConfirmModal'

type PendingConfirm =
  | { kind: 'refund'; title: string; message: string }
  | { kind: 'adjustment'; title: string; message: string }
  | null

export default function TransactionDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const canManagePayments = hasAdminPermission(user, ADMIN_PERMISSIONS.PAYMENTS)
  const [tx, setTx] = useState<any>(null)
  const [reconciling, setReconciling] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [refundAmountMinor, setRefundAmountMinor] = useState('')
  const [refundNote, setRefundNote] = useState('')
  const [adjustDirection, setAdjustDirection] = useState<'credit' | 'debit'>('credit')
  const [adjustAmountMinor, setAdjustAmountMinor] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null)

  const load = () => {
    if (!id) return
    adminAPI
      .getTransaction(id)
      .then((r) => setTx(r.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Failed to load transaction')))
  }

  useEffect(() => {
    load()
  }, [id])

  const reconcile = async () => {
    if (!id) return
    setReconciling(true)
    try {
      const r = await adminAPI.reconcileTransaction(id)
      setTx(r.data.transaction)
      toast.success(r.data.message || 'Reconcile completed')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Reconcile failed'))
    } finally {
      setReconciling(false)
    }
  }

  const recordRefund = async () => {
    if (!id) return
    const amountMinor = refundAmountMinor.trim() ? Number(refundAmountMinor) : undefined
    if (amountMinor !== undefined && (!Number.isFinite(amountMinor) || amountMinor <= 0)) {
      toast.error('Refund amount must be a positive number')
      return
    }
    const message = `Confirm refund${amountMinor ? ` of ₦${(amountMinor / 100).toLocaleString()}` : ''} for this payment?`
    setPendingConfirm({ kind: 'refund', title: 'Confirm refund', message })
  }

  const executeRefund = async () => {
    if (!id) return
    try {
      const amountMinor = refundAmountMinor.trim() ? Number(refundAmountMinor) : undefined
      if (amountMinor !== undefined && (!Number.isFinite(amountMinor) || amountMinor <= 0)) {
        toast.error('Refund amount must be a positive number')
        return
      }
      setRefunding(true)
      await adminAPI.recordRefund(id, {
        amountMinor,
        note: refundNote.trim() || undefined,
      })
      toast.success('Refund recorded')
      setRefundAmountMinor('')
      setRefundNote('')
      setPendingConfirm(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to record refund'))
    } finally {
      setRefunding(false)
    }
  }

  const recordWalletAdjustment = async () => {
    const mechanicId = tx?.mechanic?.id
    if (!mechanicId) return
    const amountMinor = Number(adjustAmountMinor)
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      toast.error('Adjustment amount must be a positive number')
      return
    }
    const message = `Confirm ${adjustDirection} of ₦${(amountMinor / 100).toLocaleString()} for mechanic wallet?`
    setPendingConfirm({ kind: 'adjustment', title: 'Confirm wallet adjustment', message })
  }

  const executeWalletAdjustment = async () => {
    const mechanicId = tx?.mechanic?.id
    if (!mechanicId) return
    try {
      const amountMinor = Number(adjustAmountMinor)
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
        toast.error('Adjustment amount must be a positive number')
        return
      }
      setAdjusting(true)
      await adminAPI.recordMechanicWalletAdjustment(mechanicId, {
        direction: adjustDirection,
        amountMinor,
        note: adjustNote.trim() || undefined,
      })
      toast.success(`Mechanic wallet ${adjustDirection} recorded`)
      setAdjustAmountMinor('')
      setAdjustNote('')
      setPendingConfirm(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to record wallet adjustment'))
    } finally {
      setAdjusting(false)
    }
  }

  if (!tx) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <Link to="/transactions" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        ← Back to transactions
      </Link>
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Transaction details</h1>
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Type</p>
            <p className="font-medium text-slate-800">{String(tx.type || '').replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium text-slate-800">{tx.status}</p>
          </div>
          <div>
            <p className="text-slate-500">Amount</p>
            <p className="font-medium text-slate-800">₦{(tx.amountNaira ?? tx.amountMinor / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Date</p>
            <p className="font-medium text-slate-800">{format(new Date(tx.createdAt), 'PPpp')}</p>
          </div>
          <div>
            <p className="text-slate-500">User</p>
            <p className="font-medium text-slate-800">{tx.user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Mechanic</p>
            <p className="font-medium text-slate-800">{tx.mechanic?.companyName ?? '—'}</p>
          </div>
        </div>
        {tx.reference && <p className="mt-3 text-sm text-slate-600">Reference: {tx.reference}</p>}
        {tx.paystackReference && <p className="text-sm text-slate-600">Paystack reference: {tx.paystackReference}</p>}
      </div>

      {tx.status === 'PENDING' && (
        <button
          type="button"
          onClick={reconcile}
          disabled={reconciling}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {reconciling ? 'Reconciling…' : 'Attempt payment reconciliation'}
        </button>
      )}

      {canManagePayments && tx.type === 'USER_PAYMENT' && tx.status === 'SUCCESS' && (
        <div className="mt-6 bg-white rounded-xl shadow border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800">Record refund (ledger only)</h2>
          <p className="text-sm text-slate-500 mt-1">Creates a REFUND transaction linked to this payment.</p>
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <input
              type="number"
              min={1}
              value={refundAmountMinor}
              onChange={(e) => setRefundAmountMinor(e.target.value)}
              placeholder={`Amount in kobo (leave empty for full: ${tx.amountMinor})`}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              value={refundNote}
              onChange={(e) => setRefundNote(e.target.value)}
              placeholder="Optional note"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={recordRefund}
            disabled={refunding}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {refunding ? 'Recording refund…' : 'Record refund'}
          </button>
        </div>
      )}

      {canManagePayments && tx.mechanic?.id && (
        <div className="mt-6 bg-white rounded-xl shadow border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800">Mechanic wallet adjustment</h2>
          <p className="text-sm text-slate-500 mt-1">Creates an admin mechanic credit/debit ledger entry.</p>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <select
              value={adjustDirection}
              onChange={(e) => setAdjustDirection(e.target.value as 'credit' | 'debit')}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input
              type="number"
              min={1}
              value={adjustAmountMinor}
              onChange={(e) => setAdjustAmountMinor(e.target.value)}
              placeholder="Amount in kobo"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="Optional note"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={recordWalletAdjustment}
            disabled={adjusting}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {adjusting ? 'Recording adjustment…' : 'Record wallet adjustment'}
          </button>
        </div>
      )}
      <ConfirmModal
        open={pendingConfirm !== null}
        title={pendingConfirm?.title ?? ''}
        message={pendingConfirm?.message ?? ''}
        confirmText={pendingConfirm?.kind === 'refund' ? 'Record refund' : 'Record adjustment'}
        confirmVariant={pendingConfirm?.kind === 'refund' ? 'danger' : 'primary'}
        loading={refunding || adjusting}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (pendingConfirm?.kind === 'refund') {
            void executeRefund()
            return
          }
          if (pendingConfirm?.kind === 'adjustment') {
            void executeWalletAdjustment()
          }
        }}
      />
    </div>
  )
}
