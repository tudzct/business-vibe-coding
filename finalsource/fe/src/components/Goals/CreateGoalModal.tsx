import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { categoryService } from '../../api/category.service'
import { goalService } from '../../api/goal.service'
import type { Category, CreateGoalRequest } from '../../api/types'

interface CreateGoalModalProps {
  readonly onClose: () => void
  readonly onCreated: (message: string, goalId: number) => void
}

interface FormState {
  goalType: CreateGoalRequest['goal_type']
  categoryId: string
  startDate: string
  endDate: string
  targetAmount: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialForm: FormState = {
  goalType: 'Saving', categoryId: '', startDate: '', endDate: '', targetAmount: '',
}

const inputClass = 'mt-2 h-12 w-full rounded-lg border border-[#d6d9db] bg-white px-4 text-sm text-[#454545] outline-none transition focus:border-[#299D91] focus:ring-2 focus:ring-[#299D91]/20 disabled:cursor-not-allowed disabled:bg-gray-50'

const readApiMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback
  const body: unknown = error.response?.data
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) return message.join(' ')
  }
  return fallback
}

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const addUtcDays = (value: Date, days: number): string => {
  const result = new Date(value)
  result.setUTCHours(0, 0, 0, 0)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const categoryRequest = useRef<AbortController | null>(null)
  const submitRequest = useRef<AbortController | null>(null)

  const loadCategories = async (): Promise<void> => {
    categoryRequest.current?.abort()
    const controller = new AbortController()
    categoryRequest.current = controller
    setCategoriesLoading(true)
    setCategoryError('')
    try {
      const response = await categoryService.getCategories(controller.signal)
      if (!response.success || !response.data) {
        setCategoryError(response.message || 'Unable to load categories. Please try again.')
        return
      }
      setCategories(response.data)
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setCategoryError(readApiMessage(error, 'Đã xảy ra lỗi hệ thống khi lấy danh sách danh mục. Vui lòng thử lại sau.'))
      }
    } finally {
      if (!controller.signal.aborted) setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
    return () => {
      categoryRequest.current?.abort()
      submitRequest.current?.abort()
    }
  }, [])

  const updateField = (field: keyof FormState, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setRequestError('')
  }

  const updateGoalType = (value: FormState['goalType']): void => {
    setForm((current) => ({ ...current, goalType: value, categoryId: value === 'Saving' ? '' : current.categoryId }))
    setErrors((current) => ({ ...current, goalType: undefined, categoryId: undefined }))
    setRequestError('')
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    const targetAmount = Number(form.targetAmount)
    const categoryId = Number(form.categoryId)
    if (form.goalType !== 'Saving' && form.goalType !== 'Expense_Limit') next.goalType = 'Select Saving or Expense Limit.'
    if (
      !form.targetAmount.trim()
      || !Number.isFinite(targetAmount)
      || targetAmount < 100_000
      || targetAmount > 1_000_000_000
      || targetAmount % 10_000 !== 0
    ) next.targetAmount = 'Enter 100,000–1,000,000,000 VND in steps of 10,000.'
    if (!isValidIsoDate(form.startDate)) {
      next.startDate = 'Enter a valid start date.'
    } else {
      const today = new Date()
      const earliestStart = addUtcDays(today, -7)
      const latestStart = addUtcDays(today, 30)
      if (form.startDate < earliestStart || form.startDate > latestStart) {
        next.startDate = 'Choose a start date from 7 days ago through 30 days ahead.'
      }
    }
    if (!isValidIsoDate(form.endDate)) {
      next.endDate = 'Enter a valid end date.'
    } else if (isValidIsoDate(form.startDate)) {
      const start = new Date(`${form.startDate}T00:00:00.000Z`)
      const durationDays = (
        new Date(`${form.endDate}T00:00:00.000Z`).getTime() - start.getTime()
      ) / (24 * 60 * 60 * 1000)
      if (durationDays < 7 || durationDays > 365) {
        next.endDate = 'Choose an end date 7–365 days after the start date.'
      }
    }
    if (form.goalType === 'Expense_Limit' && !form.categoryId) {
      next.categoryId = 'Select a category for an Expense Limit goal.'
    } else if (form.categoryId && (!Number.isInteger(categoryId) || !categories.some((category) => category.category_id === categoryId))) {
      next.categoryId = 'Select an available category.'
    }
    return next
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      document.getElementById(`goal-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    const payload: CreateGoalRequest = {
      goal_type: form.goalType,
      start_date: form.startDate,
      end_date: form.endDate,
      target_amount: Number(form.targetAmount),
      ...(form.categoryId ? { category_id: Number(form.categoryId) } : {}),
    }
    const controller = new AbortController()
    submitRequest.current = controller
    setSubmitting(true)
    setRequestError('')
    try {
      const response = await goalService.createGoal(payload, controller.signal)
      if (!response.success || !response.data) {
        setRequestError(response.message || 'Unable to create the goal.')
        return
      }
      setForm(initialForm)
      setErrors({})
      onCreated(response.message, response.data.goal_id)
    } catch (error: unknown) {
      if (!controller.signal.aborted) setRequestError(readApiMessage(error, 'Unable to create the goal. Please try again.'))
    } finally {
      if (!controller.signal.aborted) setSubmitting(false)
    }
  }

  const handleClose = (): void => {
    submitRequest.current?.abort()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1d2226]/45 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-goal-title" className="relative w-full max-w-[560px] rounded-2xl bg-white px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:px-16 sm:py-10">
        <button type="button" onClick={handleClose} className="absolute right-6 top-5 rounded p-2 text-3xl leading-none text-[#565656] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#299D91]" aria-label="Close Create Goal modal">×</button>
        <h2 id="create-goal-title" className="pr-10 text-2xl font-semibold text-[#343434]">Create Goal</h2>
        <p className="mt-2 text-sm text-[#858585]">Enter the goal details below.</p>
        <div aria-live="polite" className="mt-4 min-h-5 text-sm">
          {categoryError && <div role="alert" className="flex flex-wrap items-center gap-2 text-red-700"><span>{categoryError}</span><button type="button" onClick={() => void loadCategories()} className="font-semibold text-[#23877d] underline">Retry</button></div>}
          {requestError && <p role="alert" className="text-red-700">{requestError}</p>}
        </div>
        <form onSubmit={(event) => void handleSubmit(event)} noValidate className="mt-2 space-y-4">
          <label className="block text-sm font-semibold text-[#555]">Goal Type *
            <select id="goal-goalType" value={form.goalType} onChange={(event) => updateGoalType(event.target.value as FormState['goalType'])} className={inputClass} aria-invalid={Boolean(errors.goalType)}><option value="Saving">Saving</option><option value="Expense_Limit">Expense Limit</option></select>
            {errors.goalType && <span className="mt-1 block text-xs text-red-600">{errors.goalType}</span>}
          </label>
          <label className="block text-sm font-semibold text-[#555]">Target Amount *
            <input id="goal-targetAmount" type="number" min="100000" max="1000000000" step="10000" value={form.targetAmount} onChange={(event) => updateField('targetAmount', event.target.value)} placeholder="Enter target amount" className={inputClass} aria-invalid={Boolean(errors.targetAmount)} />
            {errors.targetAmount && <span className="mt-1 block text-xs text-red-600">{errors.targetAmount}</span>}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#555]">Start Date *
              <input id="goal-startDate" type="date" min={addUtcDays(new Date(), -7)} max={addUtcDays(new Date(), 30)} value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} className={inputClass} aria-invalid={Boolean(errors.startDate)} />
              {errors.startDate && <span className="mt-1 block text-xs text-red-600">{errors.startDate}</span>}
            </label>
            <label className="block text-sm font-semibold text-[#555]">End Date *
              <input id="goal-endDate" type="date" min={form.startDate && isValidIsoDate(form.startDate) ? addUtcDays(new Date(`${form.startDate}T00:00:00.000Z`), 7) : undefined} max={form.startDate && isValidIsoDate(form.startDate) ? addUtcDays(new Date(`${form.startDate}T00:00:00.000Z`), 365) : undefined} value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} className={inputClass} aria-invalid={Boolean(errors.endDate)} />
              {errors.endDate && <span className="mt-1 block text-xs text-red-600">{errors.endDate}</span>}
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#555]">Category {form.goalType === 'Expense_Limit' ? '*' : '(Optional)'}
            <select id="goal-categoryId" value={form.categoryId} onChange={(event) => updateField('categoryId', event.target.value)} disabled={categoriesLoading || form.goalType === 'Saving'} className={inputClass} aria-invalid={Boolean(errors.categoryId)}>
              <option value="">{categoriesLoading ? 'Loading categories…' : 'Select category'}</option>
              {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
            </select>
            {errors.categoryId && <span className="mt-1 block text-xs text-red-600">{errors.categoryId}</span>}
          </label>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button type="button" onClick={handleClose} className="h-12 rounded-lg border border-[#299D91] px-6 text-sm font-semibold text-[#299D91] hover:bg-[#299D91]/5 focus:outline-none focus:ring-2 focus:ring-[#299D91]/30">Cancel</button>
            <button type="submit" disabled={categoriesLoading || submitting} className="h-12 min-w-40 rounded-lg bg-[#299D91] px-6 text-sm font-semibold text-white hover:bg-[#23877d] focus:outline-none focus:ring-2 focus:ring-[#299D91]/40 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Creating…' : 'Create Goal'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateGoalModal
