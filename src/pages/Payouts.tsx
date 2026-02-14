import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { Banknote, Send } from 'lucide-react'
import Pagination from '../components/Pagination'

const LIMIT = 20

export default function Payouts() {
  const [mechanics, setMechanics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [payoutModal, setPayoutModal] = useState<{ mechanic: any } | null>(null)
  const [amountNaira, setAmountNaira] = useState('')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    adminAPI
      .getPayoutsMechanics()
      .then((r) => setMechanics(r.data ?? []))
      .catch(() => toast.error('Failed to load mechanics'))
      .finally(() => setLoading(false))
  }, [])

  const totalPages = Math.ceil(mechanics.length / LIMIT) || 1
  const paginatedMechanics = mechanics.slice((page - 1) * LIMIT, page * LIMIT)

  const submitPayout = async () => {
    if (!payoutModal) return
    const amount = Math.round(parseFloat(amountNaira) * 100)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      await adminAPI.recordPayout(payoutModal.mechanic.id, amount, reference || undefined)
      toast.success('Payout recorded')
      setPayoutModal(null)
      setAmountNaira('')
      setReference('')
      adminAPI.getPayoutsMechanics().then((r) => setMechanics(r.data))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payout')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payouts</h1>
      <p className="text-slate-600 mb-6">Mechanics with balance (platform owes them) or who owe the platform. Record payouts to mechanics below.</p>
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left p-4">Mechanic</th>
                <th className="text-left p-4">Email</th>
                <th className="text-right p-4">Platform owes (₦)</th>
                <th className="text-right p-4">Mechanic owes (₦)</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMechanics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">{m.companyName} · {m.ownerFullName}</td>
                  <td className="p-4 text-slate-600">{m.email}</td>
                  <td className="p-4 text-right font-medium text-emerald-600">{(m.balance?.balanceNaira ?? 0).toLocaleString()}</td>
                  <td className="p-4 text-right font-medium text-amber-600">{(m.owing?.owingNaira ?? 0).toLocaleString()}</td>
                  <td className="p-4">
                    {(m.balance?.balanceMinor ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayoutModal({ mechanic: m })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                      >
                        <Send className="h-4 w-4" /> Pay out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && mechanics.length === 0 && (
          <div className="p-12 text-center text-slate-500">No mechanics with balance or owing.</div>
        )}
        {!loading && mechanics.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={mechanics.length}
            limit={LIMIT}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Payout modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Record payout</h2>
            <p className="text-slate-600 mb-2">{payoutModal.mechanic.companyName} · Balance: ₦{(payoutModal.mechanic.balance?.balanceNaira ?? 0).toLocaleString()}</p>
            {payoutModal.mechanic.defaultBankAccount ? (
              <p className="text-slate-700 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <span className="font-medium text-slate-800">Pay to:</span>{' '}
                {payoutModal.mechanic.defaultBankAccount.bankName} · {payoutModal.mechanic.defaultBankAccount.accountNumber} · {payoutModal.mechanic.defaultBankAccount.accountName}
              </p>
            ) : (
              <p className="text-amber-700 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                No withdrawal account set. Mechanic should add a bank account in their Wallet.
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amountNaira}
                  onChange={(e) => setAmountNaira(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference (optional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Bank ref or note"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => { setPayoutModal(null); setAmountNaira(''); setReference('') }} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={submitPayout} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
                {submitting ? 'Recording…' : <><Banknote className="h-4 w-4" /> Record payout</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
