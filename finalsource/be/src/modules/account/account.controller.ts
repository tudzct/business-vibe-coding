import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountListData, AccountService } from './account.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

interface AccountListResponse {
  success: true;
  message: 'Account list retrieved successfully.';
  data: AccountListData;
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
  async findAll(@Request() request: AuthenticatedRequest): Promise<AccountListResponse> {
    const data = await this.accountService.findAllForUser(request.user.userId);
    return {
      success: true,
      message: 'Account list retrieved successfully.',
      data,
    };
  }
}
