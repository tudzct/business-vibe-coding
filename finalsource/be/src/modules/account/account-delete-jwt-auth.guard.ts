import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccountDeleteJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    error: unknown,
    user: TUser | false | null,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException(
        'Unable to authenticate the user. Please log in again.',
      );
    }
    return user;
  }
}
