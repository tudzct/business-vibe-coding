import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthenticatedIdentity, AuthenticatedRequest } from './authenticated-request';

export { AuthenticatedRequest, AuthenticatedIdentity };

interface RequestWithOptionalIdentity extends Request {
  user?: AuthenticatedIdentity;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOptionalIdentity>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      const userId = this.parseUserId(payload.sub);
      if (userId === null) {
        throw new UnauthorizedException('Unauthorized');
      }
      request.user = {
        userId,
        ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header || typeof header !== 'string') {
      return null;
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return null;
    }
    return token.trim();
  }

  private parseUserId(raw: unknown): number | null {
    if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) {
      return raw;
    }
    if (typeof raw === 'string' && /^[1-9]\d*$/.test(raw)) {
      const parsed = Number(raw);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
  }
}
