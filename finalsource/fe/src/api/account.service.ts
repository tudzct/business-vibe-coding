import axiosInstance from './axiosInstance'
import { Account, ApiResponse } from './types'

export interface AccountOption {
  id: number
  bankName: string
  accountType: string
  accountNumberLast4: string
  balance: number
}

interface AccountOptionsData {
  accounts: AccountOption[]
}

export const accountService = {
  getAccountOptions: async (signal?: AbortSignal): Promise<ApiResponse<AccountOptionsData>> => {
    const response = await axiosInstance.get('/v1/accounts', { signal })
    return response.data
  },

  // Lấy danh sách tài khoản của user
  getAccounts: async (): Promise<ApiResponse<Account[]>> => {
    const response = await axiosInstance.get('/accounts')
    return response.data
  },

  // Lấy chi tiết một tài khoản
  getAccount: async (accountId: number): Promise<ApiResponse<Account>> => {
    const response = await axiosInstance.get(`/accounts/${accountId}`)
    return response.data
  },

  // Tạo tài khoản mới
  createAccount: async (data: Omit<Account, 'account_id'>): Promise<ApiResponse<Account>> => {
    const response = await axiosInstance.post('/accounts', data)
    return response.data
  },

  // Cập nhật tài khoản
  updateAccount: async (accountId: number, data: Partial<Account>): Promise<ApiResponse<Account>> => {
    const response = await axiosInstance.put(`/accounts/${accountId}`, data)
    return response.data
  },

  // Xóa tài khoản
  deleteAccount: async (accountId: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/accounts/${accountId}`)
    return response.data
  },
}
