import axios from 'axios';
import { httpClient } from './httpClient';
import type { ApiError, ApiSuccess, User } from './types';

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

export interface SafeApiFailure {
  statusCode: number | null;
  message: string;
}

export async function registerUser(request: RegisterRequest): Promise<RegisterData> {
  const response = await httpClient.post<ApiSuccess<RegisterData>>('/auth/register', request);
  const payload = response.data;
  if (!payload.success || !payload.data?.accessToken || !isUser(payload.data.user)) {
    throw { statusCode: null, message: 'Registration failed' } satisfies SafeApiFailure;
  }
  return payload.data;
}

export function toSafeApiFailure(error: unknown): SafeApiFailure {
  if (isSafeFailure(error)) return error;
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
    return { statusCode: error.response?.status ?? null, message: message || 'Registration failed' };
  }
  return { statusCode: null, message: 'Registration failed' };
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Record<string, unknown>;
  return typeof user.id === 'number' && typeof user.fullName === 'string' && typeof user.email === 'string';
}

function isSafeFailure(value: unknown): value is SafeApiFailure {
  if (typeof value !== 'object' || value === null) return false;
  const failure = value as Record<string, unknown>;
  return (typeof failure.statusCode === 'number' || failure.statusCode === null) && typeof failure.message === 'string';
}
