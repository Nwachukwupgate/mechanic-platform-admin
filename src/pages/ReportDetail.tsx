import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { adminAPI, getApiErrorMessage } from '../services/api'

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState<any>(null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (!id) return
    adminAPI
      .getReport(id)
      .then((r) => setReport(r.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Failed to load complaint')))
  }, [id])

  const resolve = async () => {
    if (!id) return
    setResolving(true)
    try {
      const r = await adminAPI.resolveReport(id)
      setReport(r.data)
      toast.success('Complaint marked as resolved')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Could not resolve complaint'))
    } finally {
      setResolving(false)
    }
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const booking = report.booking
  const resolved = Boolean(booking?.disputeResolvedAt)

  return (
    <div>
      <Link to="/reports" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium">
        ← Back to complaints
      </Link>
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Complaint details</h1>
        <p className="text-sm text-slate-500 mt-1">Report ID: {report.id}</p>
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Reason</p>
            <p className="font-medium text-slate-800">{report.reason}</p>
          </div>
          <div>
            <p className="text-slate-500">Reporter</p>
            <p className="font-medium text-slate-800">{report.reporterRole}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium text-slate-800">{format(new Date(report.createdAt), 'PPpp')}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium text-slate-800">{resolved ? 'Resolved' : 'Open'}</p>
          </div>
        </div>
        {report.details && (
          <div className="mt-4">
            <p className="text-slate-500 text-sm">Details</p>
            <p className="text-slate-800">{report.details}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-2">Booking context</h2>
        <p className="text-sm text-slate-600">Booking ID: {booking?.id}</p>
        <p className="text-sm text-slate-600">Status: {booking?.status}</p>
        <p className="text-sm text-slate-600 mt-2">
          User: {booking?.user?.firstName} {booking?.user?.lastName} ({booking?.user?.email})
        </p>
        <p className="text-sm text-slate-600">
          Mechanic: {booking?.mechanic?.companyName ?? '—'} {booking?.mechanic?.email ? `(${booking.mechanic.email})` : ''}
        </p>
        {booking?.disputeResolvedAt && (
          <p className="text-sm text-emerald-700 mt-2">
            Resolved on {format(new Date(booking.disputeResolvedAt), 'PPpp')}
          </p>
        )}
      </div>

      {!resolved && (
        <button
          type="button"
          onClick={resolve}
          disabled={resolving}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {resolving ? 'Resolving…' : 'Mark complaint resolved'}
        </button>
      )}
    </div>
  )
}
