import axiosInstance from './axiosInstance'
import {
  ApiResponse,
  CreatedTransaction,
  CreateTransactionRequest,
  Transaction,
  TransactionListQuery,
  TransactionListResult,
} from './types'

export const transactionService = {
  // Lấy danh sách giao dịch
  getTransactions: async (
    params: TransactionListQuery = { type: 'All', limit: 10, offset: 0 },
    signal?: AbortSignal
  ): Promise<ApiResponse<TransactionListResult>> => {
    const response = await axiosInstance.get<ApiResponse<TransactionListResult>>('/v1/transactions', {
      params,
      signal,
    })
    return response.data
  },

  // Lấy chi tiết một giao dịch
  getTransaction: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}`)
    return response.data
  },

  // Tạo giao dịch mới
  createTransaction: async (data: CreateTransactionRequest): Promise<ApiResponse<CreatedTransaction>> => {
    const response = await axiosInstance.post<ApiResponse<CreatedTransaction>>('/v1/transactions', data)
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

