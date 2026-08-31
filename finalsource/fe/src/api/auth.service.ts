import axiosInstance from './axiosInstance'
import { ApiResponse, User } from './types'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegistrationPayload {
  accessToken: string
  user: { id: number; fullName: string; email: string }
}

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await axiosInstance.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<RegistrationPayload>> => {
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  },

  logout: (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get('/auth/me')
    return response.data
  },
}
