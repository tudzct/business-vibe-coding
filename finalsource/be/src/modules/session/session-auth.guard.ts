import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type SessionPrincipal = { principalId: string; userId: string; sessionId: string };

declare module 'express-serve-static-core' {
  interface Request {
    sessionPrincipal?: SessionPrincipal;
  }
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Authentication required');
    const token = header.slice('Bearer '.length).trim();
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || !token) throw new UnauthorizedException('Authentication required');
    try {
      const payload = await this.jwt.verifyAsync<{ sub?: string; userId?: string; sessionId?: string }>(token, { secret });
      if (!payload.sub || !payload.userId || !payload.sessionId) throw new Error('Incomplete session principal');
      request.sessionPrincipal = { principalId: payload.sub, userId: payload.userId, sessionId: payload.sessionId };
      return true;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
