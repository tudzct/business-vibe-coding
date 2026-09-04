import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { savingsService } from '../../api/savings.service'
import type { MonthlySavings, SavingsSummaryResult } from '../../api/types'
import { formatCurrency } from '../../utils/format'

interface ChartRow {
  readonly month: string
  readonly thisYear: number
  readonly lastYear: number
  readonly thisYearCount: number
  readonly lastYearCount: number
}

const readErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'Unable to load the savings summary. Please try again.'
  }
  const responseData: unknown = error.response?.data
  if (typeof responseData !== 'object' || responseData === null || !('message' in responseData)) {
    return 'Unable to load the savings summary. Please try again.'
  }
  const message = responseData.message
  if (typeof message === 'string') {
    return message
  }
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ')
  }
  return 'Unable to load the savings summary. Please try again.'
}

const mergeSeries = (
  thisYear: readonly MonthlySavings[],
  lastYear: readonly MonthlySavings[],
): ChartRow[] => {
  const thisYearByMonth = new Map(thisYear.map((item) => [item.month, item]))
  const lastYearByMonth = new Map(lastYear.map((item) => [item.month, item]))
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0')
    const current = thisYearByMonth.get(month)
    const previous = lastYearByMonth.get(month)
    return {
      month,
      thisYear: current?.amount ?? 0,
      lastYear: previous?.amount ?? 0,
      thisYearCount: current?.transaction_count ?? 0,
      lastYearCount: previous?.transaction_count ?? 0,
    }
  })
}

const SavingsTooltip: React.FC<TooltipContentProps> = ({
  active,
  label,
  payload,
}) => {
  if (!active || !payload?.length) {
    return null
  }

  const row = payload[0]?.payload as ChartRow | undefined
  if (!row) {
    return null
  }

  return (
    <div className="rounded-lg border border-[#e3e7e7] bg-white px-4 py-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-[#4d4d4d]">Month {String(label)}</p>
      {payload.map((entry) => {
        const isCurrent = entry.dataKey === 'thisYear'
        const amount = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0)
        return (
          <div key={String(entry.dataKey)} className="mt-1 flex min-w-52 items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{String(entry.name)}</span>
            <span className="font-semibold text-[#252525]">
              {amount > 0 ? '+' : ''}{formatCurrency(amount)} · {isCurrent ? row.thisYearCount : row.lastYearCount} transactions
            </span>
          </div>
        )
      })}
    </div>
  )
}

const SavingsSummaryChart: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [yearInput, setYearInput] = useState(String(currentYear))
  const [summary, setSummary] = useState<SavingsSummaryResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const requestSequence = useRef(0)
  const activeController = useRef<AbortController | null>(null)

  const loadSummary = useCallback(async (year: number): Promise<void> => {
    activeController.current?.abort()
    const controller = new AbortController()
    activeController.current = controller
    const sequence = requestSequence.current + 1
    requestSequence.current = sequence
    setIsLoading(true)
    setError('')

    try {
      const response = await savingsService.getSavingsSummary(year, controller.signal)
      if (sequence !== requestSequence.current) {
        return
      }
      if (response.success && response.data) {
        setSummary(response.data)
        setYearInput(String(response.data.year))
      } else {
        setError(response.message || 'Unable to load the savings summary. Please try again.')
      }
    } catch (requestError: unknown) {
      if (!controller.signal.aborted && sequence === requestSequence.current) {
        setError(readErrorMessage(requestError))
      }
    } finally {
      if (sequence === requestSequence.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadSummary(currentYear)
    return () => activeController.current?.abort()
  }, [currentYear, loadSummary])

  const chartData = useMemo(
    () => mergeSeries(summary?.summary.this_year ?? [], summary?.summary.last_year ?? []),
    [summary],
  )
  const isEmpty = summary !== null && chartData.every(
    (item) => item.thisYearCount === 0 && item.lastYearCount === 0,
  )

  const submitYear = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (!/^\d{4}$/.test(yearInput)) {
      setValidationError('Enter a four-digit year.')
      return
    }
    setValidationError('')
    void loadSummary(Number(yearInput))
  }

  const resolvedYear = summary?.year ?? currentYear

  return (
    <article className="min-h-[292px] rounded-xl bg-white px-5 py-6 shadow-[0_14px_34px_rgba(0,0,0,0.08)] sm:px-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <h2 className="font-semibold text-[#4d4d4d]">Saving Summary</h2>
          <form onSubmit={submitYear} className="flex items-start gap-2">
            <div>
              <label htmlFor="savings-year" className="sr-only">Savings summary year</label>
              <input
                id="savings-year"
                value={yearInput}
                onChange={(event) => {
                  setYearInput(event.target.value)
                  setValidationError('')
                  setError('')
                }}
                disabled={isLoading}
                inputMode="numeric"
                maxLength={4}
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'savings-year-error' : undefined}
                className="w-20 rounded border border-[#d7d7d7] bg-[#f7f7f7] px-2 py-1 text-xs text-[#666] outline-none focus:border-[#299D91] focus:ring-2 focus:ring-[#299D91]/20 disabled:cursor-wait"
              />
              {validationError && <p id="savings-year-error" className="mt-1 text-xs text-red-600">{validationError}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="rounded border border-[#299D91] px-2 py-1 text-xs font-medium text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30 disabled:opacity-50">
              Apply
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[#777]" aria-label="Chart legend">
          <span><i className="mr-2 inline-block h-2 w-4 rounded bg-[#299D91]" />{resolvedYear}</span>
          <span><i className="mr-2 inline-block h-2 w-4 rounded bg-[#c5c8c8]" />{resolvedYear - 1}</span>
        </div>
      </div>

      <div aria-live="polite" className="mt-3 min-h-5 text-sm text-red-600">
        {error}
      </div>

      {isLoading && !summary ? (
        <div className="mt-3 flex h-44 items-center justify-center rounded-lg bg-[#f7f8f8] text-sm text-[#777]">Loading savings summary…</div>
      ) : isEmpty ? (
        <div className="mt-3 flex h-44 flex-col items-center justify-center rounded-lg bg-[#f7f8f8] text-center text-sm text-[#777]">
          <p>No transaction data is available for these periods.</p>
          {error && <button type="button" onClick={() => void loadSummary(Number(yearInput))} className="mt-3 text-[#299D91] underline">Retry</button>}
        </div>
      ) : (
        <div className="mt-2 h-48" aria-label={`Monthly savings comparison for ${resolvedYear} and ${resolvedYear - 1}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }} accessibilityLayer>
              <defs>
                <linearGradient id="savings-current-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#299D91" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#299D91" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e8e8e8" vertical horizontal={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#999', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} width={70} tick={{ fill: '#999', fontSize: 12 }} tickFormatter={(value: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} />
              <Tooltip content={SavingsTooltip} cursor={{ stroke: '#d7d7d7' }} />
              <Area type="monotone" dataKey="lastYear" name={String(resolvedYear - 1)} stroke="#c5c8c8" strokeDasharray="5 5" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="thisYear" name={String(resolvedYear)} stroke="#299D91" fill="url(#savings-current-fill)" strokeWidth={2} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="sr-only">The chart compares monthly net savings for {resolvedYear} and {resolvedYear - 1}.</p>
        </div>
      )}
      {isLoading && summary && <p className="mt-1 text-right text-xs text-[#777]">Updating…</p>}
    </article>
  )
}

export default SavingsSummaryChart
