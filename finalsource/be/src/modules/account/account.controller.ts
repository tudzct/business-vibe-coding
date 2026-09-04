import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountListData, AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

interface AccountListResponse {
  success: true;
  message: 'Account list retrieved successfully.';
  data: AccountListData;
}

interface AccountCreateResponse {
  success: true;
  message: 'Account created successfully';
  data: {
    account: Awaited<ReturnType<AccountService['create']>>;
  };
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid account creation request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Account number already exists for this owner' })
  @ApiInternalServerErrorResponse({ description: 'Account creation failed safely' })
  async create(
    @Request() request: AuthenticatedRequest,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountCreateResponse> {
    const account = await this.accountService.create(request.user.userId, dto);
    return {
      success: true,
      message: 'Account created successfully',
      data: { account },
    };
  }
}
