import type { UpcomingBill } from '../../api/types'

interface UpcomingBillsProps {
  readonly bills: UpcomingBill[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly onRetry: () => void
}

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)

const parseDate = (value: string): Date | null => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const DueDate = ({ value }: { readonly value: string }) => {
  const date = parseDate(value)
  if (!date) {
    return <time dateTime={value}>{value}</time>
  }

  return (
    <time
      dateTime={value}
      className="flex h-[82px] w-[72px] shrink-0 flex-col items-center justify-center rounded-lg bg-[#F4F5F7]"
    >
      <span className="text-sm font-semibold text-[#929296]">
        {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}
      </span>
      <span className="mt-1 text-2xl font-bold text-[#55555A]">{date.getDate()}</span>
    </time>
  )
}

const formatDate = (value: string): string => {
  const date = parseDate(value)
  return date
    ? new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date)
    : value
}

const UpcomingBills = ({ bills, isLoading, error, onRetry }: UpcomingBillsProps) => (
  <section aria-labelledby="upcoming-bills-heading">
    <h1 id="upcoming-bills-heading" className="mb-4 text-2xl font-normal text-[#8D8D8D]">
      Upcoming Bills
    </h1>

    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_32px_rgba(0,0,0,0.08)]">
      <div className="hidden grid-cols-[88px_168px_minmax(260px,1fr)_230px_110px] gap-6 border-b border-[#ECECEE] px-6 py-7 text-[15px] font-bold text-[#202024] lg:grid">
        <span>Due Date</span>
        <span>Logo</span>
        <span>Item Description</span>
        <span>Last Charge</span>
        <span className="text-right">Amount</span>
      </div>

      {isLoading && (
        <div role="status" aria-label="Loading upcoming bills" className="divide-y divide-[#ECECEE] px-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid animate-pulse gap-5 py-8 lg:grid-cols-[88px_168px_minmax(260px,1fr)_230px_110px]">
              <div className="h-[82px] w-[72px] rounded-lg bg-[#F0F1F2]" />
              <div className="h-12 w-28 self-center rounded bg-[#F0F1F2]" />
              <div className="h-12 self-center rounded bg-[#F0F1F2]" />
              <div className="h-5 w-28 self-center rounded bg-[#F0F1F2]" />
              <div className="h-12 w-24 self-center justify-self-end rounded bg-[#F0F1F2]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div role="alert" className="px-6 py-16 text-center">
          <p className="text-[#66666A]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded bg-[#299D91] px-5 py-2.5 font-semibold text-white hover:bg-[#23897F] focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && bills.length === 0 && (
        <div className="px-6 py-16 text-center">
          <p className="text-lg font-semibold text-[#55555A]">No upcoming bills</p>
          <p className="mt-2 text-sm text-[#99999D]">Upcoming bill information will appear here when available.</p>
        </div>
      )}

      {!isLoading && !error && bills.length > 0 && (
        <div className="divide-y divide-[#ECECEE] px-6">
          {bills.map((bill) => (
            <article
              key={bill.billId}
              className="grid gap-5 py-8 lg:grid-cols-[88px_168px_minmax(260px,1fr)_230px_110px] lg:items-center lg:gap-6"
            >
              <DueDate value={bill.dueDate} />
              <div className="flex min-h-12 items-center">
                {bill.logoUrl ? (
                  <img
                    src={bill.logoUrl}
                    alt={`${bill.itemDescription} logo`}
                    className="max-h-14 max-w-[140px] object-contain object-left"
                  />
                ) : (
                  <span className="text-sm text-[#A1A1A5]">No logo</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#202024]">{bill.itemDescription}</h2>
              </div>
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase text-[#A1A1A5] lg:hidden">Last Charge</span>
                {bill.lastChargeDate ? (
                  <time dateTime={bill.lastChargeDate} className="text-[#9A9A9E]">{formatDate(bill.lastChargeDate)}</time>
                ) : (
                  <span className="text-[#A1A1A5]">—</span>
                )}
              </div>
              <div className="lg:text-right">
                <span className="mb-1 block text-xs font-semibold uppercase text-[#A1A1A5] lg:hidden">Amount</span>
                <span className="inline-flex min-w-24 justify-center rounded-lg border border-[#E1E1E4] px-5 py-3 text-lg font-bold text-[#202024]">
                  {formatAmount(bill.amount)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  </section>
)

export default UpcomingBills
