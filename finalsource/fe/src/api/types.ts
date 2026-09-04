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
  id: number
  account_id?: number
  user_id?: number
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
  receipt_id?: string
  category_id?: number
}

export interface AccountListResult {
  user_id: number
  accounts: Account[]
}

export type TransactionFilter = 'All' | 'Revenue' | 'Expense'

export interface TransactionListQuery {
  type: TransactionFilter
  limit?: number
  offset?: number
}

export interface TransactionListResult {
  data: Transaction[]
  total: number
  hasMore: boolean
}

export interface CreateTransactionRequest {
  accountId: number
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  category_id?: number
  shopName: string
  amount: number
  paymentMethod: string
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
  status: 'Complete' | 'Pending' | 'Failed'
  receiptId: string | null
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
  category_id: number | null
  start_date: string
  end_date: string
  target_amount: number
  target_achieved: boolean
  last_updated: string
}

export interface CreateGoalRequest {
  goal_type: 'Saving' | 'Expense_Limit'
  category_id?: number
  start_date: string
  end_date: string
  target_amount: number
}

export interface CreateGoalResult {
  goal_id: number
}

export interface UpdateGoalRequest {
  target_amount: number
}

export interface UpdatedGoal {
  goal_id: number
  target_amount: number
}

export interface UpdateGoalResult {
  updated_goal: UpdatedGoal
}

export interface SavingGoalListItem {
  goal_id: number
  goal_type: 'Saving'
  target_amount: number
  target_achieved: number
  start_date: string
  end_date: string
}

export interface ExpenseGoalListItem {
  goal_id: number
  category: string
  target_amount: number
  current_expense: number
}

export interface GoalListResult {
  savingGoal: SavingGoalListItem | null
  expenseGoals: ExpenseGoalListItem[]
}

export interface MonthlySavings {
  month: string
  amount: number
  transaction_count: number
}

export interface SavingsSummaryData {
  this_year: MonthlySavings[]
  last_year: MonthlySavings[]
}

export interface SavingsSummaryResult {
  user_id: number
  year: number
  summary: SavingsSummaryData
}
