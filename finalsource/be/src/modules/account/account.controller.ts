import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountOption, AccountService } from './account.service';

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOkResponse({ description: 'Authenticated account options' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async list(@Req() request: AuthenticatedRequest): Promise<{
    success: true;
    message: string;
    data: { accounts: AccountOption[] };
  }> {
    const accounts = await this.accountService.findOptions(request.user.userId);
    return { success: true, message: 'Accounts retrieved successfully', data: { accounts } };
  }
}
