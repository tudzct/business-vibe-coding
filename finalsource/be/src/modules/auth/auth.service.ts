import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';

export interface RegistrationPayload {
  accessToken: string;
  user: { id: number; fullName: string; email: string };
}

const permittedPasswordPattern = /^[A-Za-z0-9!@#$%^&*(){}_+=[\],./<>?\\|:;-]+$/;
const specialCharacterPattern = /[!@#$%^&*(){}_+=[\],./<>?\\|:;-]/;

@Injectable()
export class AuthService {
  private readonly passwordRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegistrationPayload> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const fullName = dto.fullName.trim().normalize('NFC');
    const email = dto.email.trim().toLowerCase();
    if (
      fullName.length < 4 ||
      fullName.length > 25 ||
      !/^\p{L}+(?: \p{L}+)*$/u.test(fullName)
    ) {
      throw new BadRequestException(
        'fullName must be 4 to 25 letters with single spaces between words.',
      );
    }
    if (!email || email.length > 255 || !isEmail(email)) {
      throw new BadRequestException('email must be a valid email address of at most 255 characters.');
    }
    if (
      dto.password.length < 8 ||
      dto.password.length > 64 ||
      /\s/.test(dto.password) ||
      !/[a-z]/.test(dto.password) ||
      !/[A-Z]/.test(dto.password) ||
      !/[0-9]/.test(dto.password) ||
      !specialCharacterPattern.test(dto.password) ||
      !permittedPasswordPattern.test(dto.password)
    ) {
      throw new BadRequestException(
        'password must be 8 to 64 permitted characters and include lowercase, uppercase, digit, and special characters with no whitespace.',
      );
    }

    const existingUser = await this.users.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('This email is already registered.');
    }

    try {
      const password = await bcrypt.hash(dto.password, this.passwordRounds);
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(User);
        const user = repository.create({ fullName, email, password });
        const created = await repository.save(user);
        const accessToken = await this.jwtService.signAsync({
          sub: created.userId,
          email: created.email,
        });

        return {
          accessToken,
          user: {
            id: created.userId,
            fullName: created.fullName,
            email: created.email,
          },
        };
      });
    } catch (error: unknown) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('This email is already registered.');
      }
      throw new InternalServerErrorException(
        'Registration could not be completed.',
      );
    }
  }

  private isDuplicateEntry(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError: unknown = error.driverError;
    return (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError &&
      driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
