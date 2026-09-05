import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Account, AccountType } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountDetailResponseDto } from './dto/account-detail-response.dto';
import {
  Transaction,
  TransactionType,
} from '../transaction/transaction.entity';

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

export type AccountListItem = AccountListItemDto;
export type AccountListData = AccountListDataDto;

export interface CreatedAccount extends AccountListItemDto {
  readonly user_id: number;
}

interface BalanceTotalRow {
  total: string | number | null;
}

interface RiskExposureRow {
  totalDebt: string | number | null;
  totalSafeAssets: string | number | null;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
  ) {}

  async findOneWithTransactions(
    accountId: number,
    userId: number,
  ): Promise<AccountDetailResponseDto> {
    try {
      const account = await this.accounts.findOne({
        where: { accountId },
      });
      if (!account) {
        throw new NotFoundException('Account not found.');
      }
      if (account.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to view this account details.',
        );
      }

      if (
        account.accountType === AccountType.INVESTMENT ||
        account.accountType === AccountType.CREDIT_CARD
      ) {
        const exposure = await this.accounts
          .createQueryBuilder('account')
          .select(
            'COALESCE(SUM(CASE WHEN account.accountType = :loanType THEN account.balance ELSE 0 END), 0)',
            'totalDebt',
          )
          .addSelect(
            'COALESCE(SUM(CASE WHEN account.accountType IN (:...safeTypes) THEN account.balance ELSE 0 END), 0)',
            'totalSafeAssets',
          )
          .where('account.userId = :userId', { userId })
          .setParameters({
            loanType: AccountType.LOAN,
            safeTypes: [AccountType.CHECKING, AccountType.SAVINGS],
          })
          .getRawOne<RiskExposureRow>();
        const totalDebt = Number(exposure?.totalDebt ?? 0);
        const totalSafeAssets = Number(exposure?.totalSafeAssets ?? 0);
        if (totalDebt > totalSafeAssets) {
          throw new ForbiddenException(
            'You do not have permission to view this account details.',
          );
        }
      }

      const transactions = await this.transactions.find({
        where: { accountId },
        order: { transactionDate: 'DESC', transactionId: 'DESC' },
        take: 5,
      });

      return {
        id: account.accountId,
        bank_name: account.bankName,
        account_type: account.accountType,
        branch_name: account.branchName ?? null,
        account_number_full: account.accountNumberFull,
        balance: Number(account.balance),
        recent_transactions: transactions.map((transaction) => {
          const absoluteAmount = Math.abs(Number(transaction.amount));
          const isHighValueExpense =
            transaction.type === TransactionType.EXPENSE &&
            absoluteAmount > Number(account.balance) / 2;

          return {
            date:
              transaction.transactionDate instanceof Date
                ? transaction.transactionDate.toISOString().slice(0, 10)
                : String(transaction.transactionDate).slice(0, 10),
            amount:
              transaction.type === TransactionType.EXPENSE
                ? -absoluteAmount
                : absoluteAmount,
            description: `${transaction.itemDescription}${isHighValueExpense ? ' [HIGH VALUE]' : ''}`,
            status: transaction.status,
            receipt_id: transaction.receiptId ?? null,
            type: transaction.type,
          };
        }),
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'A banking system error occurred. Please try again later.',
      );
    }
  }

  async findAllByUserId(userId: number): Promise<AccountListDataDto> {
    try {
      const accounts = await this.accounts.find({
        where: { userId },
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

  async findAllForUser(userId: number): Promise<AccountListDataDto> {
    return this.findAllByUserId(userId);
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

    if (dto.account_type === AccountType.INVESTMENT) {
      const qualifyingBalance = await this.getInvestmentCapacity(userId);
      if (qualifyingBalance < 100000) {
        throw new BadRequestException(
          'Investment accounts require at least 100000 in existing Checking and Savings balances.',
        );
      }
    }

    await this.ensureAccountNumberAvailable(userId, dto.account_number_full);

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

  private async ensureAccountNumberAvailable(
    userId: number,
    accountNumberFull: string,
  ): Promise<void> {
    let existingAccount: Account | null;
    try {
      existingAccount = await this.accounts.findOne({
        where: { userId, accountNumberFull },
        select: { accountId: true },
      });
    } catch {
      throw new InternalServerErrorException(
        'An internal server error occurred while processing your request. Please try again later.',
      );
    }

    if (existingAccount) {
      throw new ConflictException(
        'The submitted resource conflicts with an existing record in the system.',
      );
    }
  }

  private async getInvestmentCapacity(userId: number): Promise<number> {
    try {
      const row = await this.accounts
        .createQueryBuilder('account')
        .select('COALESCE(SUM(account.balance), 0)', 'total')
        .where('account.userId = :userId', { userId })
        .andWhere('account.accountType IN (:...accountTypes)', {
          accountTypes: [AccountType.CHECKING, AccountType.SAVINGS],
        })
        .getRawOne<BalanceTotalRow>();
      const total = Number(row?.total ?? 0);
      if (!Number.isFinite(total)) throw new Error('Invalid balance aggregate');
      return total;
    } catch {
      throw new InternalServerErrorException(
        'An internal server error occurred while processing your request. Please try again later.',
      );
    }
  }
}
