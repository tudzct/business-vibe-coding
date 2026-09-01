import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountService } from './account.service';
import { AccountListDataDto } from './dto/account-list-response.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOkResponse({ description: 'Account list retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Account retrieval failed safely' })
  async findAll(@Request() request: AuthenticatedRequest): Promise<{
    success: true;
    message: string;
    data: AccountListDataDto;
  }> {
    const data = await this.accountService.findAllByUserId(request.user.userId);
    return { success: true, message: 'Account list retrieved successfully.', data };
  }
}
