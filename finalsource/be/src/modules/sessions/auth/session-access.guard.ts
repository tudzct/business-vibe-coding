import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { SessionPrincipal } from './session-principal';

interface SessionAccessTokenPayload {
  readonly principalId?: unknown;
  readonly userId?: unknown;
  readonly sessionId?: unknown;
}

interface AuthenticatedRequest extends Request {
  sessionPrincipal?: SessionPrincipal;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

@Injectable()
export class SessionAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Authentication is unavailable');
    }

    try {
      const payload = await this.jwtService.verifyAsync<SessionAccessTokenPayload>(
        header.slice('Bearer '.length),
        { secret },
      );
      if (
        !isNonEmptyString(payload.principalId) ||
        !isNonEmptyString(payload.userId) ||
        !isNonEmptyString(payload.sessionId)
      ) {
        throw new UnauthorizedException('Authentication is invalid');
      }
      request.sessionPrincipal = {
        principalId: payload.principalId,
        userId: payload.userId,
        sessionId: payload.sessionId,
      };
      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Authentication is invalid');
    }
  }
}
