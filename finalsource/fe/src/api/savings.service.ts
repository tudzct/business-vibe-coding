import axiosInstance from './axiosInstance'
import type { ApiResponse, SavingsSummaryResult } from './types'

export const savingsService = {
  getSavingsSummary: async (
    year: number,
    signal?: AbortSignal,
  ): Promise<ApiResponse<SavingsSummaryResult>> => {
    const response = await axiosInstance.get<ApiResponse<SavingsSummaryResult>>(
      '/v1/savings/summary',
      { params: { year }, signal },
    )
    return response.data
  },
}
