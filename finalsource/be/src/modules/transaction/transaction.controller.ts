import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
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
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionListQueryDto } from './dto/transaction-list-query.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { CreatedTransactionPayload, TransactionService } from './transaction.service';

interface CreateTransactionResponse {
  success: true;
  message: string;
  data: CreatedTransactionPayload;
}

interface TransactionListSuccessResponse {
  success: true;
  message: string;
  data: TransactionListResponseDto;
}

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
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
    @Req() request: AuthenticatedRequest,
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
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid transaction request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Transaction persistence failed safely' })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ): Promise<CreateTransactionResponse> {
    const data = await this.transactionService.create(request.user.userId, dto);
    return { success: true, message: 'Transaction created successfully', data };
  }
}
