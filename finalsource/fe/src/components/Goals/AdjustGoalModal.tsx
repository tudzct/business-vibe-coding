import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { goalService } from '../../api/goal.service'
import type { UpdatedGoal } from '../../api/types'

interface AdjustGoalModalProps {
  readonly goal: UpdatedGoal
  readonly onClose: () => void
  readonly onUpdated: (message: string, goalId: number, targetAmount: number) => void
}

interface ErrorEnvelope {
  readonly message?: string | string[]
}

const fallbackError = 'Đã xảy ra lỗi hệ thống khi cập nhật mục tiêu. Vui lòng thử lại sau.'

const readApiMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return fallbackError
  const body: unknown = error.response?.data
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as ErrorEnvelope).message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ')
    }
  }
  return fallbackError
}

const formatVnd = (amount: number): string =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)} VND`

const AdjustGoalModal: React.FC<AdjustGoalModalProps> = ({ goal, onClose, onUpdated }) => {
  const [targetAmount, setTargetAmount] = useState(String(goal.target_amount))
  const [fieldError, setFieldError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const request = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => request.current?.abort()
  }, [])

  const handleClose = (): void => {
    if (!submitting) onClose()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (submitting) return

    const amount = Number(targetAmount)
    if (
      !targetAmount.trim()
      || !Number.isFinite(amount)
      || amount < 100_000
      || amount > 1_000_000_000
      || amount % 10_000 !== 0
    ) {
      setFieldError('Enter an amount from 100,000 to 1,000,000,000 VND in increments of 10,000 VND.')
      inputRef.current?.focus()
      return
    }
    if (amount === goal.target_amount) {
      setFieldError('Enter a target amount different from the current target.')
      inputRef.current?.focus()
      return
    }
    if (!Number.isInteger(goal.goal_id) || goal.goal_id < 1) {
      setRequestError('The selected goal is invalid. Refresh the goals list and try again.')
      return
    }

    const controller = new AbortController()
    request.current = controller
    setSubmitting(true)
    setFieldError('')
    setRequestError('')
    try {
      const response = await goalService.updateGoal(
        goal.goal_id,
        { target_amount: amount },
        controller.signal,
      )
      if (!response.success || !response.data) {
        setRequestError(response.message || fallbackError)
        return
      }
      onUpdated(
        response.message,
        response.data.updated_goal.goal_id,
        response.data.updated_goal.target_amount,
      )
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        const message = readApiMessage(error)
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          setFieldError(message)
        } else {
          setRequestError(message)
        }
      }
    } finally {
      if (!controller.signal.aborted) setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose() }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-goal-title"
        className="relative w-full max-w-[520px] rounded-lg bg-white px-7 pb-6 pt-[26px] shadow-[0_10px_28px_rgba(0,0,0,0.16)]"
      >
        <button
          type="button"
          disabled={submitting}
          onClick={handleClose}
          aria-label="Close Adjust Financial Goal modal"
          className="absolute right-5 top-4 rounded p-2 text-2xl leading-none text-[#8a8f98] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2fa79d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ×
        </button>

        <h2 id="adjust-goal-title" className="pr-12 text-xl font-bold text-[#25272a]">Adjust Financial Goal</h2>
        <p className="mt-1 text-xs text-[#8a8f98]">Update only the target amount for this goal.</p>

        <div className="mt-[18px] flex h-12 items-center justify-between rounded bg-[#f7f9f9] px-3.5">
          <span className="text-[13px] text-[#8a8f98]">Current target</span>
          <span className="text-sm font-medium text-[#25272a]">{formatVnd(goal.target_amount)}</span>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} noValidate className="mt-[18px]">
          <label htmlFor="adjust-target-amount" className="block text-[13px] font-medium text-[#25272a]">
            New target amount
          </label>
          <div className="mt-[7px] flex h-[50px] items-center rounded border-[1.5px] border-[#2fa79d] bg-white px-[15px] focus-within:ring-2 focus-within:ring-[#2fa79d]/20">
            <input
              ref={inputRef}
              id="adjust-target-amount"
              type="number"
              min="100000"
              max="1000000000"
              step="10000"
              value={targetAmount}
              disabled={submitting}
              aria-invalid={Boolean(fieldError)}
              aria-describedby="adjust-target-help adjust-target-error"
              onChange={(event) => {
                setTargetAmount(event.target.value)
                setFieldError('')
                setRequestError('')
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#25272a] outline-none disabled:cursor-not-allowed"
            />
            <span className="ml-3 text-xs text-[#8a8f98]">VND</span>
          </div>

          <div id="adjust-target-help" className="mt-2 flex min-h-[34px] items-center gap-2 text-xs text-[#8a8f98]">
            <strong className="text-[#2fa79d]" aria-hidden="true">i</strong>
            <span>100,000–1,000,000,000 VND, in increments of 10,000 VND.</span>
          </div>
          <div id="adjust-target-error" aria-live="polite" className="min-h-5 text-xs text-red-700">
            {fieldError && <span role="alert">{fieldError}</span>}
          </div>
          <div aria-live="polite" className="min-h-5 text-xs text-red-700">
            {requestError && <span role="alert">{requestError}</span>}
          </div>

          <div className="mt-2 flex h-[42px] items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={handleClose}
              className="h-[42px] w-[104px] rounded border border-[#e3e6e8] bg-white text-[13px] font-medium text-[#25272a] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-[42px] min-w-[112px] rounded bg-[#2fa79d] px-4 text-[13px] font-medium text-white hover:bg-[#278f86] focus:outline-none focus:ring-2 focus:ring-[#2fa79d]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AdjustGoalModal
