import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { userId: number };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: unknown }>(token);
      if (!Number.isInteger(payload.sub) || Number(payload.sub) <= 0) {
        throw new UnauthorizedException('Unauthorized');
      }
      (request as AuthenticatedRequest).user = { userId: Number(payload.sub) };
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
