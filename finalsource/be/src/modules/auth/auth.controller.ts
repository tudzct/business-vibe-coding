import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService, AuthenticatedSession, RegistrationPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface RegistrationResponse {
  success: true;
  message: 'Registration successful';
  data: RegistrationPayload;
}

interface LoginResponse {
  success: true;
  message: 'Successful Login';
  data: AuthenticatedSession;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Successful Login' })
  @ApiBadRequestResponse({ description: 'Invalid login input' })
  @ApiUnauthorizedResponse({ description: 'Email or password is incorrect' })
  @ApiInternalServerErrorResponse({ description: 'Login failed safely' })
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    const data = await this.authService.login(dto);
    return { success: true, message: 'Successful Login', data };
  }

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
