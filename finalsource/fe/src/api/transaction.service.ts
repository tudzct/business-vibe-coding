import axiosInstance from './axiosInstance'
import { ApiResponse, Transaction } from './types'

export interface CreateTransactionRequest {
  accountId: number
  transactionDate: string
  type: 'Revenue' | 'Expense'
  itemDescription: string
  category_id?: number | null
  shopName: string
  amount: number
  paymentMethod: string
  status: 'Complete'
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
  receiptId: number | null
  createdAt: string
  category_id: number | null
}

export const transactionService = {
  // Lấy danh sách giao dịch
  getTransactions: async (params?: {
    accountId?: number
    categoryId?: number
    type?: 'Revenue' | 'Expense'
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<Transaction[]>> => {
    const response = await axiosInstance.get('/transactions', { params })
    return response.data
  },

  // Lấy chi tiết một giao dịch
  getTransaction: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}`)
    return response.data
  },

  // Tạo giao dịch mới
  createTransaction: async (data: CreateTransactionRequest): Promise<ApiResponse<CreatedTransaction>> => {
    const response = await axiosInstance.post('/v1/transactions', data)
    return response.data
  },

  // Cập nhật giao dịch
  updateTransaction: async (transactionId: number, data: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.put(`/transactions/${transactionId}`, data)
    return response.data
  },

  // Xóa giao dịch
  deleteTransaction: async (transactionId: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/transactions/${transactionId}`)
    return response.data
  },
}

