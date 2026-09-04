import { Controller, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ExpenseSummaryResponse } from './expense-summary.types';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Monthly expense summary retrieved' })
  @ApiUnauthorizedResponse({ description: 'Bearer JWT is missing or invalid' })
  @ApiInternalServerErrorResponse({ description: 'Expense aggregation failed safely' })
  async getExpenseSummary(
    @Req() request: AuthenticatedRequest,
  ): Promise<ExpenseSummaryResponse> {
    const data = await this.expensesService.getExpenseSummary(request.user.userId);
    return {
      success: true,
      message: 'Expense summary retrieved successfully.',
      data,
    };
  }
}
