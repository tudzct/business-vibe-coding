// Định nghĩa các type cho API response

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface User {
  id?: number
  fullName?: string
  user_id?: number
  full_name?: string
  email: string
  username?: string
  phone_number?: string
  profile_picture_url?: string
  total_balance?: number
}

export interface Account {
  account_id: number
  user_id: number
  bank_name: string
  account_type: 'Checking' | 'Credit Card' | 'Savings' | 'Investment' | 'Loan'
  branch_name?: string
  account_number_full?: string
  account_number_last_4?: string
  balance: number
}

export interface Category {
  category_id: number
  category_name: string
}

export interface Transaction {
  transaction_id: number
  account_id: number
  transaction_date: string
  type: 'Revenue' | 'Expense'
  item_description: string
  shop_name: string
  amount: number
  payment_method: string
  status: 'Complete' | 'Pending' | 'Failed'
  receipt_id?: number | null
  category_id?: number | null
}

export interface AccountListItem {
  id: number
  bank_name: string
  account_type: Account['account_type']
  branch_name: string | null
  account_number_last_4: string
  balance: number
}

export interface AccountListResponse {
  user_id: number
  accounts: AccountListItem[]
}

export type TransactionFilter = 'All' | 'Revenue' | 'Expense'

export interface TransactionListQuery {
  type?: TransactionFilter
  limit?: number
  offset?: number
}

export interface TransactionListResponse {
  data: Transaction[]
  total: number
  hasMore: boolean
}

export type TransactionStatus = 'Complete' | 'Pending' | 'Failed'

export interface CreateTransactionPayload {
  accountId: number
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  category_id?: number | null
  shopName: string
  amount: number
  paymentMethod: string
  status?: TransactionStatus
}

export interface CreatedTransaction {
  transactionId: number
  accountId: number
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  shopName: string
  amount: number
  paymentMethod: string
  status: TransactionStatus
  receiptId: number | string | null
  createdAt: string
  category_id: number | null
}

export interface Bill {
  bill_id: number
  user_id: number
  due_date: string
  logo_url?: string
  item_description: string
  last_charge_date?: string
  amount: number
}

export interface Goal {
  goal_id: number
  user_id: number
  goal_type: 'Saving' | 'Expense_Limit'
  category_id: number
  start_date: string
  end_date: string
  target_amount: number
  target_achieved: boolean
  last_updated: string
}

export interface ExpenseSummaryItem {
  month: string
  totalExpense: number
}

export interface ExpenseSubCategory {
  item_description: string
  amount: number
  date: string
}

export interface BreakdownResult {
  category: string
  total: number
  changePercent: number | null
  subCategories: ExpenseSubCategory[]
}
