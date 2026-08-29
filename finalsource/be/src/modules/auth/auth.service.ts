import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class AuthService {
  private static readonly bcryptRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const fullName = dto.fullName.normalize('NFC').trim();
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.users.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const username = await this.createUniqueUsername(email);
    const passwordHash = await bcrypt.hash(
      dto.password,
      AuthService.bcryptRounds,
    );
    const user = this.users.create({
      fullName,
      email,
      username,
      passwordHash,
      totalBalance: '0.0000',
    });

    try {
      const savedUser = await this.users.save(user);
      const accessToken = await this.jwtService.signAsync({
        sub: savedUser.id,
      });

      return {
        success: true,
        message: 'Registration successful',
        data: {
          accessToken,
          user: {
            id: savedUser.id,
            fullName: savedUser.fullName,
            email: savedUser.email,
          },
        },
      };
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  private async createUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0] || 'user';
    let candidate = base;
    let suffix = 1;

    while (await this.users.exists({ where: { username: candidate } })) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}
