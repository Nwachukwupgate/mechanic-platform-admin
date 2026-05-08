type ModalShellProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidthClassName?: string
  closeOnBackdrop?: boolean
}

export default function ModalShell({
  open,
  onClose,
  children,
  maxWidthClassName = 'max-w-md',
  closeOnBackdrop = true,
}: ModalShellProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={closeOnBackdrop ? onClose : undefined} />
      <div className={`relative w-full ${maxWidthClassName} bg-white rounded-xl shadow-xl border border-slate-200 p-6`}>
        {children}
      </div>
    </div>
  )
}
