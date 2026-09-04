import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, RegistrationPayload } from '../api/auth.service'
import type { User } from '../api/types'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegistrationPayload>
  logout: () => void
  updateUser: (userData: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
