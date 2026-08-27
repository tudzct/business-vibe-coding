export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
}
