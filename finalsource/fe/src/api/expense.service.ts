import axiosInstance from './axiosInstance'
import type { ApiResponse, ExpenseSummaryItem } from './types'

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
}
