import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account, AccountType } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';

export interface AccountListItem {
  id: number;
  bank_name: string;
  account_type: AccountType;
  branch_name: string | null;
  account_number_last_4: string;
  balance: number;
}

export interface AccountListData {
  user_id: number;
  accounts: AccountListItem[];
}

export interface AccountResponseDto {
  id: number;
  user_id: number;
  bank_name: string;
  account_type: AccountType;
  branch_name: string | null;
  account_number_last_4: string;
  balance: number;
}

interface DatabaseError {
  code?: string;
  errno?: number;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
  ) {}

  async findAllForUser(userId: number): Promise<AccountListData> {
    try {
      const accounts = await this.accounts.find({
        where: { userId },
        select: {
          accountId: true,
          bankName: true,
          accountType: true,
          branchName: true,
          accountNumberLast4: true,
          balance: true,
        },
        order: { accountId: 'ASC' },
      });

      return {
        user_id: userId,
        accounts: accounts.map((account) => ({
          id: account.accountId,
          bank_name: account.bankName,
          account_type: account.accountType,
          branch_name: account.branchName ?? null,
          account_number_last_4: account.accountNumberLast4,
          balance: Number(account.balance),
        })),
      };
    } catch {
      throw new InternalServerErrorException(
        'system error occurred. Please try again later.',
      );
    }
  }

  async create(userId: number, dto: CreateAccountDto): Promise<AccountResponseDto> {
    this.validateCreationRules(dto);

    try {
      const duplicate = await this.accounts.exists({
        where: { userId, accountNumberFull: dto.account_number_full },
      });
      if (duplicate) {
        throw new ConflictException('An account with this account number already exists.');
      }

      if (dto.account_type === AccountType.INVESTMENT) {
        const qualifyingBalance = await this.accounts.sum('balance', {
          userId,
          accountType: In([AccountType.CHECKING, AccountType.SAVINGS]),
        });
        if (Number(qualifyingBalance ?? 0) < 100000) {
          throw new BadRequestException(
            'Investment accounts require at least 100,000 in existing Checking and Savings balances.',
          );
        }
      }

      const account = this.accounts.create({
        userId,
        bankName: dto.bank_name,
        accountType: dto.account_type,
        branchName: dto.branch_name ?? null,
        accountNumberFull: dto.account_number_full,
        accountNumberLast4: dto.account_number_full.slice(-4),
        balance: dto.balance,
      });
      const saved = await this.accounts.save(account);

      return {
        id: saved.accountId,
        user_id: saved.userId,
        bank_name: saved.bankName,
        account_type: saved.accountType,
        branch_name: saved.branchName ?? null,
        account_number_last_4: saved.accountNumberLast4,
        balance: Number(saved.balance),
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('An account with this account number already exists.');
      }
      throw new InternalServerErrorException('Unable to create account. Please try again later.');
    }
  }

  private validateCreationRules(dto: CreateAccountDto): void {
    if (!Object.values(AccountType).includes(dto.account_type)) {
      throw new BadRequestException('account_type must be a valid account type');
    }
    if (!dto.bank_name.trim() || !dto.account_number_full.trim()) {
      throw new BadRequestException('Bank name and account number are required.');
    }
    if (!Number.isFinite(dto.balance) || dto.balance < 0) {
      throw new BadRequestException('balance must be a non-negative number');
    }
    if (!/^[0-9]{8,34}$/.test(dto.account_number_full)) {
      throw new BadRequestException('account_number_full must contain 8 to 34 digits');
    }
    const branchRequired =
      dto.account_type === AccountType.LOAN || dto.account_type === AccountType.INVESTMENT;
    if (branchRequired && !dto.branch_name?.trim()) {
      throw new BadRequestException('branch_name is required for Loan and Investment accounts');
    }
    const minimumBalance =
      dto.account_type === AccountType.SAVINGS || dto.account_type === AccountType.INVESTMENT
        ? 50000
        : 0;
    if (dto.balance < minimumBalance) {
      throw new BadRequestException(
        'Savings and Investment accounts require an initial balance of at least 50,000.',
      );
    }
  }

  private isDuplicateEntry(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const databaseError = error as DatabaseError;
    return databaseError.code === 'ER_DUP_ENTRY' || databaseError.errno === 1062;
  }
}
