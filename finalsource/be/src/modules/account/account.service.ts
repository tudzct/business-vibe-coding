import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './account.entity';

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
}
