import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseBreakdownQueryDto } from './dto/expense-breakdown-query.dto';
import type { ExpenseBreakdownResponse } from './expense-breakdown.types';
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

  @Get('breakdown')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Selected-month expense breakdown retrieved' })
  @ApiBadRequestResponse({ description: 'The month query is missing or invalid' })
  @ApiUnauthorizedResponse({ description: 'Bearer JWT is missing or invalid' })
  @ApiNotFoundResponse({ description: 'No expense breakdown data is available' })
  @ApiInternalServerErrorResponse({ description: 'Expense breakdown processing failed safely' })
  async getExpensesBreakdown(
    @Req() request: AuthenticatedRequest,
    @Query() query: ExpenseBreakdownQueryDto,
  ): Promise<ExpenseBreakdownResponse> {
    const data = await this.expensesService.getExpensesBreakdown(
      request.user.userId,
      query.month,
    );
    return {
      success: true,
      message: 'Expense breakdown retrieved successfully',
      data,
    };
  }
}
