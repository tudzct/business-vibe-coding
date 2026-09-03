import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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

export interface CreatedAccount extends AccountListItem {
  user_id: number;
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

  async createForUser(userId: number, dto: CreateAccountDto): Promise<CreatedAccount> {
    if (
      [AccountType.LOAN, AccountType.INVESTMENT].includes(dto.account_type) &&
      !dto.branch_name?.trim()
    ) {
      throw new BadRequestException(
        'branch_name is required for Loan and Investment accounts.',
      );
    }

    if (
      [AccountType.SAVINGS, AccountType.INVESTMENT].includes(dto.account_type) &&
      dto.balance < 50000
    ) {
      throw new BadRequestException(
        'balance must be at least 50000 for Savings and Investment accounts.',
      );
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

    try {
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
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException(
          'The submitted resource conflicts with an existing record in the system.',
        );
      }
      throw new InternalServerErrorException(
        'An internal server error occurred while processing your request. Please try again later.',
      );
    }
  }

  private isDuplicateEntry(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError: unknown = error.driverError;
    return (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError &&
      driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
