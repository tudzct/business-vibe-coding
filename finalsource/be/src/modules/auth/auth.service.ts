import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';

export interface RegisterResponse {
  success: true;
  message: string;
  data: { accessToken: string; user: { id: number; fullName: string; email: string } };
}

const namePattern = /^\p{L}+(?: \p{L}+)*$/u;
const allowedPassword = /^[A-Za-z0-9!@#$%^&*(){}_=+[\],./<>?\\|:;-]+$/;
const specialCharacter = /[!@#$%^&*(){}\-_+=[\],./<>?\\|:;]/;

function isDuplicateEntry(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driver = error.driverError as { code?: unknown; errno?: unknown };
  return driver.code === 'ER_DUP_ENTRY' || driver.errno === 1062;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const fullName = dto.fullName.normalize('NFC').trim();
    const email = dto.email.trim().toLowerCase();
    const nameLength = Array.from(fullName).length;
    if (nameLength < 4 || nameLength > 25 || !namePattern.test(fullName)) {
      throw new BadRequestException('Invalid full name');
    }
    if (!email || email.length > 255 || !isEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }
    if (
      dto.password.length < 8 || dto.password.length > 64 ||
      /\s/.test(dto.password) || !/[a-z]/.test(dto.password) ||
      !/[A-Z]/.test(dto.password) || !/[0-9]/.test(dto.password) ||
      !specialCharacter.test(dto.password) || !allowedPassword.test(dto.password)
    ) {
      throw new BadRequestException('Invalid password');
    }
    if (dto.confirmPassword !== dto.password) {
      throw new BadRequestException('Passwords do not match');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.users.manager.transaction(async (manager): Promise<RegisterResponse> => {
        const repository = manager.getRepository(User);
        const existing = await repository.createQueryBuilder('user')
          .where('LOWER(TRIM(user.email)) = :email', { email })
          .getOne();
        if (existing) throw new ConflictException('This email is already registered');

        const user = await repository.save(repository.create({ fullName, email, passwordHash }));
        const accessToken = await this.jwt.signAsync({ sub: user.id });
        return {
          success: true,
          message: 'Registration successful',
          data: { accessToken, user: { id: user.id, fullName: user.fullName, email: user.email } },
        };
      });
    } catch (error: unknown) {
      if (isDuplicateEntry(error)) throw new ConflictException('This email is already registered');
      throw error;
    }
  }
}
