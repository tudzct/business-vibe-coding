import { Controller, Get, Request as RequestDecorator, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountListDataDto, AccountService } from './account.service';

interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOkResponse({ description: 'Account list retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Account retrieval failed safely' })
  async findAll(@RequestDecorator() request: AuthenticatedRequest) {
    const data: AccountListDataDto = await this.accountService.findAllByUserId(
      request.user.userId,
    );
    return { success: true, message: 'Account list retrieved successfully.', data };
  }
}
