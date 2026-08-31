import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthenticatedIdentity } from './authenticated-request';

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
    const authorization = request.headers.authorization;
    if (!authorization) {
      return null;
    }
    const [scheme, token, extra] = authorization.trim().split(/\s+/);
    return scheme?.toLowerCase() === 'bearer' && token && !extra ? token : null;
  }

  private parseUserId(subject: unknown): number | null {
    const userId =
      typeof subject === 'number'
        ? subject
        : typeof subject === 'string' && subject.trim() !== ''
          ? Number(subject)
          : Number.NaN;
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  }
}
