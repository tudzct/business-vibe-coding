import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { AuthUser } from '../api/types'
import { authService, RegisterRequest } from '../api/auth.service'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (userData: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        const userData: unknown = JSON.parse(savedUser)
        if (isAuthUser(userData)) {
          setUser(userData)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        // Có thể gọi API để verify token và lấy user mới nhất
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password })
      if (response.success && response.data) {
        const { user: userData, token } = response.data
        const mappedUser: AuthUser = {
          id: userData.user_id,
          fullName: userData.full_name,
          email: userData.email,
        }
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại')
      }
    } catch (error: unknown) {
      throw new Error(getApiMessage(error, 'Đăng nhập thất bại'))
    }
  }

  const register = async (request: RegisterRequest) => {
    try {
      const response = await authService.register(request)
      const accessToken = response.data?.accessToken
      const registeredUser = response.data?.user

      if (!response.success || !accessToken || !isAuthUser(registeredUser)) {
        throw new Error(response.message || 'Registration failed')
      }

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(registeredUser))
      setUser(registeredUser)
    } catch (error: unknown) {
      throw new Error(getApiMessage(error, 'Registration failed'))
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateUser = (userData: AuthUser) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.email === 'string'
  )
}

function getApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as Record<string, unknown>).message
      if (typeof message === 'string') {
        return message
      }
      if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
        return message.join(', ')
      }
    }
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
