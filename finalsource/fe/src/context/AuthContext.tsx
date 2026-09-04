import { useEffect, useState, ReactNode } from 'react'
import { User } from '../api/types'
import { authService, LoginRequest, RegisterRequest, RegistrationPayload } from '../api/auth.service'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (data: LoginRequest): Promise<void> => {
    const response = await authService.login(data)
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed')
    }
    const { user: userData, accessToken } = response.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (data: RegisterRequest): Promise<RegistrationPayload> => {
    const response = await authService.register(data)
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed')
    }
    localStorage.setItem('token', response.data.accessToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    setUser(response.data.user)
    return response.data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

