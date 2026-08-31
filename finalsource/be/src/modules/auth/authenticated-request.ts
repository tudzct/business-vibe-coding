import type { Request } from 'express';

export interface AuthenticatedIdentity {
  userId: number;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedIdentity;
}
