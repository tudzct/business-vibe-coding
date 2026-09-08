import { useEffect, useRef } from 'react'

export interface AccountDeletionTarget {
  readonly id: number
  readonly bankName: string
  readonly lastFour: string
}

interface DeleteAccountModalProps {
  readonly target: AccountDeletionTarget
  readonly isDeleting: boolean
  readonly targetUnavailable: boolean
  readonly error: string | null
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

const DeleteAccountModal = ({
  target,
  isDeleting,
  targetUnavailable,
  error,
  onCancel,
  onConfirm,
}: DeleteAccountModalProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (error) cancelButtonRef.current?.focus()
  }, [error])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191919]/45 px-4 py-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
        className="relative flex w-full max-w-[560px] flex-col items-center gap-8 rounded-2xl bg-white p-6 text-center shadow-[0_20px_25px_rgba(76,103,100,0.10)] sm:p-12"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="Close account deletion confirmation"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#666] hover:bg-[#f4f5f7] focus:outline-none focus:ring-2 focus:ring-[#299d91] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ×
        </button>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f233331a] text-3xl text-[#e53333]" aria-hidden="true">⚠</span>
        <h2 id="delete-account-title" className="text-[22px] font-bold text-[#191919]">Confirm Account Deletion</h2>
        <p id="delete-account-description" className="text-sm leading-[22px] text-[#595959]">
          WARNING: Are you sure you want to delete the {target.bankName} - {target.lastFour} account? This action will PERMANENTLY delete the account and ALL related transactions.
        </p>
        <div aria-live="assertive" className="min-h-5 w-full text-sm text-[#b42318]">
          {isDeleting ? 'Deleting account…' : error}
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded border border-[#ccd1d6] bg-[#ebedf0] px-8 py-3 text-sm font-semibold text-[#333] focus:outline-none focus:ring-2 focus:ring-[#299d91] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {targetUnavailable ? 'Back to Balances' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || targetUnavailable}
            className="flex-1 rounded bg-[#d92e2e] px-8 py-3 text-sm font-semibold text-white hover:bg-[#bd2424] focus:outline-none focus:ring-2 focus:ring-[#d92e2e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : targetUnavailable ? 'Unavailable' : 'Confirm Delete'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeleteAccountModal
