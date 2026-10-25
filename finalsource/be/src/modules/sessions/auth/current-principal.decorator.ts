import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionPrincipal } from './session-principal';

interface AuthenticatedRequest extends Request {
  readonly sessionPrincipal?: SessionPrincipal;
}

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionPrincipal => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.sessionPrincipal) {
      throw new Error('Authenticated principal was not attached to the request');
    }
    return request.sessionPrincipal;
  },
);
