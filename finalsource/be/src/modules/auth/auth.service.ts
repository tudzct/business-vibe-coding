import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterDataDto } from './dto/register-response.dto';

const fullNamePattern = /^\p{L}+(?: \p{L}+)*$/u;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPasswordPattern = /^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$/;
const passwordSpecialPattern = /[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;]/;

interface MysqlDriverError { code?: unknown; errno?: unknown }

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterDataDto> {
    const normalized = this.normalize(dto);
    if (!this.isRegistrationInputValid(normalized)) throw new BadRequestException('Registration input is invalid');
    if (normalized.password !== normalized.confirmPassword) throw new BadRequestException('Passwords do not match');

    const existing = await this.users.findOne({ where: { email: normalized.email } });
    if (existing) throw new ConflictException('This email is already registered.');

    try {
      const saved = await this.users.manager.transaction(async (manager) => {
        const repository = manager.getRepository(User);
        const passwordHash = await bcrypt.hash(normalized.password, 10);
        const username = await this.nextUsername(normalized.email, repository);
        return repository.save(repository.create({
          fullName: normalized.fullName,
          email: normalized.email,
          username,
          passwordHash,
          totalBalance: '0.0000',
        }));
      });
      const accessToken = await this.jwt.signAsync({ sub: saved.id, email: saved.email });
      return { accessToken, user: { id: saved.id, fullName: saved.fullName, email: saved.email } };
    } catch (error: unknown) {
      if (this.isDuplicateEntry(error)) throw new ConflictException('This email is already registered.');
      throw error;
    }
  }

  isRegistrationInputValid(dto: RegisterDto): boolean {
    return dto.fullName.length >= 4 && dto.fullName.length <= 25 && fullNamePattern.test(dto.fullName)
      && dto.email.length > 0 && dto.email.length <= 255 && emailPattern.test(dto.email)
      && dto.password.length >= 8 && dto.password.length <= 64
      && !/\s/.test(dto.password) && /[a-z]/.test(dto.password) && /[A-Z]/.test(dto.password)
      && /[0-9]/.test(dto.password) && passwordSpecialPattern.test(dto.password)
      && allowedPasswordPattern.test(dto.password) && dto.confirmPassword === dto.password;
  }

  private normalize(dto: RegisterDto): RegisterDto {
    return {
      fullName: dto.fullName.normalize('NFC').trim(),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      confirmPassword: dto.confirmPassword,
    };
  }

  private async nextUsername(email: string, repository: Repository<User>): Promise<string> {
    const base = email.slice(0, email.indexOf('@'));
    let candidate = base;
    let suffix = 1;
    while (await repository.exists({ where: { username: candidate } })) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  private isDuplicateEntry(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError = error.driverError as MysqlDriverError;
    return driverError.code === 'ER_DUP_ENTRY' || driverError.errno === 1062;
  }
}
