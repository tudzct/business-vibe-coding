import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request as RequestDecorator,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionListQueryDto } from './dto/transaction-list-query.dto';
import {
  TransactionListResponseDto,
  CreateTransactionDataDto,
  TransactionService,
} from './transaction.service';

interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

interface TransactionListEnvelope {
  readonly success: true;
  readonly message: 'Transactions retrieved successfully.';
  readonly data: TransactionListResponseDto;
}

interface CreateTransactionEnvelope {
  readonly success: true;
  readonly message: 'Transaction created successfully';
  readonly data: CreateTransactionDataDto;
}

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or missing transaction data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Transaction creation failed safely' })
  async create(
    @RequestDecorator() request: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ): Promise<CreateTransactionEnvelope> {
    const data = await this.transactionService.create(request.user.userId, dto);
    return { success: true, message: 'Transaction created successfully', data };
  }

  @Get()
  @ApiOkResponse({ description: 'Transactions retrieved successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction query parameter' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Transaction retrieval failed safely' })
  async findAll(
    @RequestDecorator() request: AuthenticatedRequest,
    @Query() query: TransactionListQueryDto,
  ): Promise<TransactionListEnvelope> {
    const data = await this.transactionService.findAllByUserId(
      request.user.userId,
      query,
    );
    return { success: true, message: 'Transactions retrieved successfully.', data };
  }
}
