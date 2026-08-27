import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { registerUser, type RegisterRequest } from '../api/auth';
import type { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  register: (request: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const value = localStorage.getItem('user');
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const user = parsed as Record<string, unknown>;
    return typeof user.id === 'number' && typeof user.fullName === 'string' && typeof user.email === 'string'
      ? { id: user.id, fullName: user.fullName, email: user.email }
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    register: async (request) => {
      const data = await registerUser(request);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
