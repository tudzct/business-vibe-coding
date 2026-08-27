import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponsePayload } from '../../interceptors/response.interceptor';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterDataDto } from './dto/register-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RegisterDataDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Registration input is invalid' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Normalized email is already registered' })
  async register(@Body() dto: RegisterDto): Promise<ApiResponsePayload<RegisterDataDto>> {
    return { message: 'Registration successful', data: await this.auth.register(dto) };
  }
}
