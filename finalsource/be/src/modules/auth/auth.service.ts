import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDataDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';

interface MysqlDriverError {
  code?: string;
  errno?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterDataDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const fullName = dto.fullName.normalize('NFC').trim();
    const email = dto.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ConflictException('Email is already registered');
    }

    const username = await this.createUniqueUsername(email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({ fullName, email, username, passwordHash, totalBalance: '0.0000' });

    try {
      const saved = await this.users.save(user);
      const accessToken = await this.jwt.signAsync({ sub: saved.id, email: saved.email });
      return { accessToken, user: { id: saved.id, fullName: saved.fullName, email: saved.email } };
    } catch (error: unknown) {
      if (this.isDuplicateKey(error)) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  private async createUniqueUsername(email: string): Promise<string> {
    const prefix = email.split('@')[0] || 'user';
    let candidate = prefix;
    let suffix = 1;
    while (await this.users.exists({ where: { username: candidate } })) {
      candidate = `${prefix}${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  private isDuplicateKey(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError = error.driverError as MysqlDriverError;
    return driverError.code === 'ER_DUP_ENTRY' || driverError.errno === 1062;
  }
}
