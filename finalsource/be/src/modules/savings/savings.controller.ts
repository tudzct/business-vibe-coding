import {
  Controller,
  Get,
  Query,
  Request as RequestDecorator,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { SavingsSummaryQueryDto } from './dto/savings-summary-query.dto';
import {
  SavingsService,
  SavingsSummaryResponseDto,
} from './savings.service';

interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

interface SavingsSummaryEnvelope {
  readonly success: true;
  readonly message: 'Savings summary retrieved successfully';
  readonly data: SavingsSummaryResponseDto;
}

@ApiTags('savings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get('summary')
  @ApiOkResponse({ description: 'Savings summary retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiInternalServerErrorResponse({
    description: 'Savings summary processing failed safely',
  })
  async getSavingsSummary(
    @RequestDecorator() request: AuthenticatedRequest,
    @Query() query: SavingsSummaryQueryDto,
  ): Promise<SavingsSummaryEnvelope> {
    const year = this.resolveYear(query.year);
    const data = await this.savingsService.getSavingsSummary(
      request.user.userId,
      year,
    );
    return {
      success: true,
      message: 'Savings summary retrieved successfully',
      data,
    };
  }

  private resolveYear(value: string | undefined): number {
    const currentYear = new Date().getFullYear();
    if (!value || !/^\d{4}$/.test(value)) {
      return currentYear;
    }

    const parsedYear = Number.parseInt(value, 10);
    return parsedYear >= currentYear - 5 && parsedYear <= currentYear
      ? parsedYear
      : currentYear;
  }
}
