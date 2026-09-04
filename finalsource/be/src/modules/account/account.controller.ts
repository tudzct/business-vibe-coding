import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AccountListDataDto, AccountService, CreatedAccount } from './account.service';
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

  @Post()
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
