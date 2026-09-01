import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreatedTransactionPayload, TransactionService } from './transaction.service';

interface CreateTransactionResponse {
  success: true;
  message: 'Transaction created successfully';
  data: CreatedTransactionPayload;
}

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
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
