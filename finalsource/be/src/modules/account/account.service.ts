import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account, AccountType } from './account.entity';

const TRANSACTION_ACCOUNT_TYPES = [
  AccountType.CHECKING,
  AccountType.SAVINGS,
  AccountType.CREDIT_CARD,
] as const;

export interface AccountListItemDto {
  readonly id: number;
  readonly bank_name: string;
  readonly account_type: string;
  readonly branch_name: string | null;
  readonly account_number_last_4: string;
  readonly balance: number;
}

export interface AccountListDataDto {
  readonly user_id: number;
  readonly accounts: AccountListItemDto[];
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
  ) {}

  async findAllByUserId(userId: number): Promise<AccountListDataDto> {
    try {
      const accounts = await this.accounts.find({
        where: {
          userId,
          accountType: In([...TRANSACTION_ACCOUNT_TYPES]),
        },
        order: { accountId: 'ASC' },
      });
      return {
        user_id: userId,
        accounts: accounts.map((account) => ({
          id: account.accountId,
          bank_name: account.bankName,
          account_type: account.accountType,
          branch_name: account.branchName,
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
}
