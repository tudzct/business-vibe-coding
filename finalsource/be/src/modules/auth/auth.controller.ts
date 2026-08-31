import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService, RegistrationPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';

interface RegistrationResponse {
  success: true;
  message: 'Registration successful';
  data: RegistrationPayload;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Registration successful' })
  @ApiBadRequestResponse({ description: 'Invalid registration input' })
  @ApiConflictResponse({ description: 'Email already registered' })
  @ApiInternalServerErrorResponse({ description: 'Registration failed safely' })
  async register(@Body() dto: RegisterDto): Promise<RegistrationResponse> {
    const data = await this.authService.register(dto);
    return { success: true, message: 'Registration successful', data };
  }
}
