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
import { BillService } from './bill.service';
import type { BillsResponse } from './bill.types';

@ApiTags('bills')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Bills retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Bearer JWT is missing or invalid' })
  @ApiInternalServerErrorResponse({ description: 'Bill retrieval failed safely' })
  async getBills(@Req() request: AuthenticatedRequest): Promise<BillsResponse> {
    const data = await this.billService.findUpcomingBillsByUserId(
      request.user.userId,
    );
    return {
      success: true,
      message: 'Bills retrieved successfully',
      data,
    };
  }
}
