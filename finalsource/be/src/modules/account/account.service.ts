import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

export interface AccountOption {
  id: number;
  bankName: string;
  accountType: string;
  accountNumberLast4: string;
  balance: number;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
  ) {}

  async findOptions(userId: number): Promise<AccountOption[]> {
    try {
      const rows = await this.accounts.find({
        where: { userId },
        order: { accountId: 'ASC' },
      });
      return rows.map((account) => ({
        id: account.accountId,
        bankName: account.bankName,
        accountType: account.accountType,
        accountNumberLast4: account.accountNumberLast4,
        balance: Number(account.balance),
      }));
    } catch {
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi hệ thống khi lấy danh sách tài khoản. Vui lòng thử lại sau.',
      );
    }
  }

  async findAllByUserId(userId: number) {
    return this.findOptions(userId);
  }
}
