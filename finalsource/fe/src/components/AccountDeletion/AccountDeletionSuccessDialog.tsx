import { useEffect, useRef } from 'react'

interface AccountDeletionSuccessDialogProps {
  readonly onComplete: () => void
}

const AccountDeletionSuccessDialog = ({ onComplete }: AccountDeletionSuccessDialogProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    buttonRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191919]/45 px-4 py-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-deletion-success-title"
        aria-describedby="account-deletion-success-description"
        className="flex w-full max-w-[560px] flex-col items-center gap-8 rounded-2xl bg-white p-6 text-center shadow-[0_20px_25px_rgba(76,103,100,0.10)] sm:p-12"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#299d9114]" aria-hidden="true">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#299d91] text-3xl text-white">✓</span>
        </span>
        <div className="space-y-3" aria-live="polite">
          <h2 id="account-deletion-success-title" className="text-xl font-semibold leading-7 text-[#191919]">Account Removed Successfully!</h2>
          <p id="account-deletion-success-description" className="text-base leading-6 text-[#666]">Your account has been removed successfully.</p>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={onComplete}
          className="h-12 w-full rounded bg-[#299d91] px-8 py-3 text-base font-semibold text-white hover:bg-[#23877e] focus:outline-none focus:ring-2 focus:ring-[#299d91] focus:ring-offset-2"
        >
          Back to Balances
        </button>
      </section>
    </div>
  )
}

export default AccountDeletionSuccessDialog
