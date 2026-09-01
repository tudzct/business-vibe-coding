import type { FormEvent } from 'react'
import type { AccountOption } from '../../api/account.service'
import type { Category } from '../../api/types'

export interface TransactionFormValues {
  accountId: string
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  category_id: string
  shopName: string
  amount: string
  paymentMethod: string
  status: 'Complete'
}

export type TransactionField = Exclude<keyof TransactionFormValues, 'status'>
export type TransactionErrors = Partial<Record<TransactionField | 'form', string>>

interface AddTransactionFormProps {
  values: TransactionFormValues
  accounts: AccountOption[]
  categories: Category[]
  errors: TransactionErrors
  accountLoading: boolean
  categoryLoading: boolean
  submitLoading: boolean
  accountError: string | null
  categoryWarning: string | null
  onChange: (field: TransactionField, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

const fieldClass =
  'h-12 w-full appearance-none rounded-[6px] border border-[#D6D9DB] bg-white px-4 text-sm font-normal text-[#383838] outline-none transition placeholder:text-[#949494] focus:border-[#2FA096] focus:ring-2 focus:ring-[#2FA096]/20 disabled:bg-gray-100'

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null
}

export default function AddTransactionForm({
  values,
  accounts,
  categories,
  errors,
  accountLoading,
  categoryLoading,
  submitLoading,
  accountError,
  categoryWarning,
  onChange,
  onSubmit,
  onCancel,
}: AddTransactionFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] md:grid-cols-2">
        <label className="block text-sm font-semibold text-[#333333]">
          Transaction Type *
          <select className={`${fieldClass} mt-2`} value={values.type} onChange={(event) => onChange('type', event.target.value)}>
            <option value="Expense">Expense</option>
            <option value="Revenue">Revenue</option>
          </select>
          <FieldError message={errors.type} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Account *
          <select
            className={`${fieldClass} mt-2`}
            value={values.accountId}
            onChange={(event) => onChange('accountId', event.target.value)}
            disabled={accountLoading || accounts.length === 0}
          >
            <option value="">{accountLoading ? 'Loading accounts...' : 'Select account'}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} · {account.accountType} •••• {account.accountNumberLast4}
              </option>
            ))}
          </select>
          <FieldError message={errors.accountId ?? accountError ?? undefined} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Amount *
          <input className={`${fieldClass} mt-2`} inputMode="decimal" placeholder="0.00" value={values.amount} onChange={(event) => onChange('amount', event.target.value)} />
          <FieldError message={errors.amount} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Transaction Date *
          <input className={`${fieldClass} mt-2`} type="date" value={values.transactionDate} onChange={(event) => onChange('transactionDate', event.target.value)} />
          <FieldError message={errors.transactionDate} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Item Description *
          <input className={`${fieldClass} mt-2`} placeholder="Enter transaction description" value={values.itemDescription} onChange={(event) => onChange('itemDescription', event.target.value)} />
          <FieldError message={errors.itemDescription} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Shop Name *
          <input className={`${fieldClass} mt-2`} placeholder="Enter shop or recipient name" value={values.shopName} onChange={(event) => onChange('shopName', event.target.value)} />
          <FieldError message={errors.shopName} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Payment Method *
          <input className={`${fieldClass} mt-2`} placeholder="Enter payment method" value={values.paymentMethod} onChange={(event) => onChange('paymentMethod', event.target.value)} />
          <FieldError message={errors.paymentMethod} />
        </label>

        <label className="block text-sm font-semibold text-[#333333]">
          Category (Optional)
          <select className={`${fieldClass} mt-2`} value={values.category_id} onChange={(event) => onChange('category_id', event.target.value)} disabled={categoryLoading}>
            <option value="">{categoryLoading ? 'Loading categories...' : 'Select category'}</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
            ))}
          </select>
          {categoryWarning ? <p className="mt-1 text-xs font-normal text-amber-700">{categoryWarning}</p> : null}
          <FieldError message={errors.category_id} />
        </label>
      </div>

      {errors.form ? <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-12 w-24 rounded-[4px] border border-[#2FA096] bg-white px-6 text-sm font-semibold text-[#2FA096] hover:bg-[#2FA096]/5 focus:outline-none focus:ring-2 focus:ring-[#2FA096]/30">
          Cancel
        </button>
        <button type="submit" disabled={submitLoading || accountLoading || accounts.length === 0} className="h-12 min-w-[165px] rounded-[4px] bg-[#2FA096] px-6 text-sm font-semibold text-white hover:bg-[#278b82] focus:outline-none focus:ring-2 focus:ring-[#2FA096]/40 disabled:cursor-not-allowed disabled:opacity-60">
          {submitLoading ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  )
}
