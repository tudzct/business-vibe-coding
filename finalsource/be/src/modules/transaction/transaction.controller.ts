import {
  Controller,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { TransactionListQueryDto } from './dto/transaction-list-query.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionDataDto } from './dto/create-transaction-response.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

interface TransactionListSuccessResponse {
  success: true;
  message: 'Transactions retrieved successfully.';
  data: TransactionListResponseDto;
}

interface TransactionCreateSuccessResponse {
  success: true;
  message: 'Transaction created successfully';
  data: CreateTransactionDataDto;
}

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Transactions retrieved successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction query parameter' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Transaction retrieval failed safely' })
  async findAll(
    @Request() request: AuthenticatedRequest,
    @Query() query: TransactionListQueryDto,
  ): Promise<TransactionListSuccessResponse> {
    const data = await this.transactionService.findAllByUserId(
      request.user.userId,
      query.type,
      query.limit,
      query.offset,
    );

    return {
      success: true,
      message: 'Transactions retrieved successfully.',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Transaction created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction data or business constraint' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Transaction creation failed safely' })
  async create(
    @Request() request: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionCreateSuccessResponse> {
    const data = await this.transactionService.create(request.user.userId, dto);

    return {
      success: true,
      message: 'Transaction created successfully',
      data,
    };
  }
}
