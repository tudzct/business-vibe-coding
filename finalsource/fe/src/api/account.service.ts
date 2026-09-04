import axiosInstance from './axiosInstance'
import {
  ApiResponse,
  Account,
  AccountListResult,
  CreateAccountData,
  CreateAccountRequest,
} from './types'

export const accountService = {
  // Lấy danh sách tài khoản của user
  getAccounts: async (signal?: AbortSignal): Promise<ApiResponse<AccountListResult>> => {
    const response = await axiosInstance.get<ApiResponse<AccountListResult>>('/v1/accounts', { signal })
    return response.data
  },

  // Lấy chi tiết một tài khoản
  getAccount: async (accountId: number): Promise<ApiResponse<Account>> => {
    const response = await axiosInstance.get(`/accounts/${accountId}`)
    return response.data
  },

  // Tạo tài khoản mới
  createAccount: async (
    data: CreateAccountRequest,
    signal?: AbortSignal,
  ): Promise<ApiResponse<CreateAccountData>> => {
    const response = await axiosInstance.post<ApiResponse<CreateAccountData>>('/v1/accounts', data, {
      signal,
    })
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

