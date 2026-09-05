import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccountDetailJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    error: unknown,
    user: TUser | false | null,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException(
        'Please log in to access account services.',
      );
    }
    return user;
  }
}
