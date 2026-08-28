import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  loginAccount,
  registerAccount,
  type LoginRequest,
  type RegisterRequest,
  type User,
} from '../api/auth';

interface AuthContextValue {
  user: User | null;
  login: (request: LoginRequest) => Promise<User>;
  register: (request: RegisterRequest) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const value = JSON.parse(stored) as Partial<User>;
    return typeof value.id === 'number' && typeof value.fullName === 'string' && typeof value.email === 'string'
      ? { id: value.id, fullName: value.fullName, email: value.email }
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const persistSession = (accessToken: string, authenticatedUser: User): User => {
    const mappedUser = {
      id: authenticatedUser.id,
      fullName: authenticatedUser.fullName,
      email: authenticatedUser.email,
    };
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    setUser(mappedUser);
    return mappedUser;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: async (request) => {
      const result = await loginAccount(request);
      return persistSession(result.accessToken, result.user);
    },
    register: async (request) => {
      const result = await registerAccount(request);
      return persistSession(result.accessToken, result.user);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// AuthProvider and its colocated hook intentionally share one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
