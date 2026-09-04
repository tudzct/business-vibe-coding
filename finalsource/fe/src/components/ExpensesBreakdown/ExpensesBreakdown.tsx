import type { BreakdownResult } from '../../api/types'

interface ExpensesBreakdownProps {
  readonly selectedMonth: string
  readonly data: BreakdownResult[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly noDataMessage: string | null
  readonly onMonthChange: (month: string) => void
  readonly onRetry: () => void
}

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)

const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const comparisonPresentation = (value: number | null) => {
  if (value === null) {
    return { label: '—', arrow: '', className: 'text-[#777]' }
  }
  if (value > 0) {
    return { label: `${formatAmount(Math.abs(value))}%`, arrow: '↑', className: 'text-[#FF4B38]' }
  }
  if (value < 0) {
    return { label: `${formatAmount(Math.abs(value))}%`, arrow: '↓', className: 'text-[#2DBE73]' }
  }
  return { label: '0%', arrow: '→', className: 'text-[#777]' }
}

const BreakdownCard = ({ item }: { readonly item: BreakdownResult }) => {
  const comparison = comparisonPresentation(item.changePercent)

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_16px_30px_rgba(0,0,0,0.08)]">
      <header className="flex min-h-[78px] items-center gap-4 bg-[#E8E8E8] px-6 py-4">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D2D2D2] text-xl text-[#606064]">▦</span>
        <div className="min-w-0">
          <h3 className="truncate text-[16px] text-[#68686B]">{item.category}</h3>
          <p className="text-[21px] font-bold leading-tight text-[#171719]">{formatAmount(item.total)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`font-semibold ${comparison.className}`}>
            <span className="text-[#666]">{comparison.label}</span>{comparison.arrow && <span className="ml-2">{comparison.arrow}</span>}
          </p>
          <p className="whitespace-nowrap text-xs text-[#919194]">Compare to last month</p>
        </div>
      </header>
      <div className="px-6">
        {item.subCategories.map((detail, index) => (
          <div
            key={`${detail.item_description}-${detail.date}-${index}`}
            className="flex min-h-[78px] items-center justify-between gap-4 border-b border-[#ECECEE] py-4 last:border-b-0"
          >
            <p className="min-w-0 truncate font-semibold text-[#5D5D61]">{detail.item_description}</p>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-[#5D5D61]">{formatAmount(detail.amount)}</p>
              <time dateTime={detail.date} className="text-xs text-[#A3A3A6]">{formatDate(detail.date)}</time>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

const ExpensesBreakdown = ({
  selectedMonth,
  data,
  isLoading,
  error,
  noDataMessage,
  onMonthChange,
  onRetry,
}: ExpensesBreakdownProps) => (
  <section className="mt-8" aria-labelledby="expenses-breakdown-heading">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <h2 id="expenses-breakdown-heading" className="text-2xl font-normal text-[#8D8D8D]">Expenses Breakdown</h2>
      <div>
        <label htmlFor="expense-breakdown-month" className="mb-1 block text-xs font-medium text-[#777]">Selected month</label>
        <input
          id="expense-breakdown-month"
          type="month"
          value={selectedMonth}
          disabled={isLoading}
          onChange={(event) => onMonthChange(event.target.value)}
          className="h-10 rounded-lg border border-[#D8D8DA] bg-white px-3 text-sm text-[#525256] shadow-sm outline-none focus:border-[#299D91] focus:ring-2 focus:ring-[#299D91]/20 disabled:cursor-wait disabled:opacity-60"
        />
      </div>
    </div>

    {isLoading && (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading expense breakdown">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-60 animate-pulse rounded-lg bg-white shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
            <div className="h-20 rounded-t-lg bg-[#E8E8E8]" />
          </div>
        ))}
      </div>
    )}

    {!isLoading && error && (
      <div className="rounded-lg bg-white px-6 py-12 text-center shadow-sm" role="alert">
        <p className="text-[#666]">{error}</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded bg-[#299D91] px-5 py-2.5 font-semibold text-white hover:bg-[#23897F] focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:ring-offset-2">
          Try again
        </button>
      </div>
    )}

    {!isLoading && !error && data.length === 0 && (
      <div className="rounded-lg bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#555]">No expense breakdown data</p>
        <p className="mt-2 text-sm text-[#999]">{noDataMessage ?? 'Expense details will appear here when available.'}</p>
      </div>
    )}

    {!isLoading && !error && data.length > 0 && (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => <BreakdownCard key={item.category} item={item} />)}
      </div>
    )}
  </section>
)

export default ExpensesBreakdown
