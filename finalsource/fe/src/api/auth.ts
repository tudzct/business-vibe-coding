import { httpClient } from './httpClient';
import type { ApiSuccess } from './types';

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterData {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginData = RegisterData;

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Record<string, unknown>;
  return typeof user.id === 'number'
    && typeof user.fullName === 'string'
    && typeof user.email === 'string';
}

function requireAuthData(value: unknown, fallbackMessage: string): RegisterData {
  if (typeof value !== 'object' || value === null) throw new Error(fallbackMessage);
  const data = value as Partial<RegisterData>;
  if (typeof data.accessToken !== 'string' || !data.accessToken.trim() || !isUser(data.user)) {
    throw new Error(fallbackMessage);
  }
  return { accessToken: data.accessToken, user: data.user };
}

export async function registerAccount(request: RegisterRequest): Promise<RegisterData> {
  const response = await httpClient.post<ApiSuccess<RegisterData>>('/auth/register', request);
  return requireAuthData(response.data.data, 'Registration failed');
}

export async function loginAccount(request: LoginRequest): Promise<LoginData> {
  const response = await httpClient.post<ApiSuccess<LoginData>>('/auth/login', request);
  return requireAuthData(response.data.data, 'Login failed');
}
