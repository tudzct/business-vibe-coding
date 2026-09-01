import axiosInstance from './axiosInstance'
import type { ApiResponse, BreakdownResult, ExpenseSummaryItem } from './types'

export const expenseService = {
  getExpenseSummary: async (
    signal?: AbortSignal,
  ): Promise<ApiResponse<ExpenseSummaryItem[]>> => {
    const response = await axiosInstance.get<ApiResponse<ExpenseSummaryItem[]>>(
      '/v1/expenses/summary',
      { signal },
    )
    return response.data
  },
  getExpensesBreakdown: async (
    month: string,
    signal?: AbortSignal,
  ): Promise<ApiResponse<BreakdownResult[]>> => {
    const response = await axiosInstance.get<ApiResponse<BreakdownResult[]>>(
      '/v1/expenses/breakdown',
      { params: { month }, signal },
    )
    return response.data
  },
}
