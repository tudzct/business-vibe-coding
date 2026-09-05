import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request as RequestDecorator,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountDetailJwtAuthGuard } from './account-detail-jwt-auth.guard';
import { AccountListDataDto, AccountService, CreatedAccount } from './account.service';
import { AccountDetailResponseDto } from './dto/account-detail-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';

interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

interface AccountCreateResponse {
  success: true;
  message: 'Account created successfully';
  data: { account: CreatedAccount };
}

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Account list retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Account retrieval failed safely' })
  async findAll(@RequestDecorator() request: AuthenticatedRequest) {
    const data: AccountListDataDto = await this.accountService.findAllByUserId(
      request.user.userId,
    );
    return { success: true, message: 'Account list retrieved successfully.', data };
  }

  @Get(':id')
  @UseGuards(AccountDetailJwtAuthGuard)
  @ApiOkResponse({
    description: 'Account details retrieved successfully.',
    type: AccountDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid account identifier.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'The account belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Account not found.' })
  @ApiInternalServerErrorResponse({
    description: 'Account transaction retrieval failed safely.',
  })
  async findOne(
    @RequestDecorator() request: AuthenticatedRequest,
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () =>
          new BadRequestException('Invalid account identifier.'),
      }),
    )
    accountId: number,
  ): Promise<{
    success: true;
    message: string;
    data: AccountDetailResponseDto;
  }> {
    const data = await this.accountService.findOneWithTransactions(
      accountId,
      request.user.userId,
    );
    return {
      success: true,
      message: 'Account details retrieved successfully.',
      data,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid account payload' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Account creation conflict' })
  @ApiInternalServerErrorResponse({ description: 'Account creation failed safely' })
  async create(
    @RequestDecorator() request: AuthenticatedRequest,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountCreateResponse> {
    const account = await this.accountService.createForUser(request.user.userId, dto);
    return {
      success: true,
      message: 'Account created successfully',
      data: { account },
    };
  }
}
