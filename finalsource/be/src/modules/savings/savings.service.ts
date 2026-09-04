import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountType } from '../account/account.entity';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../transaction/transaction.entity';

export interface MonthlySavingsDto {
  readonly month: string;
  readonly amount: number;
  readonly transaction_count: number;
}

export interface SavingsSummaryDataDto {
  readonly this_year: MonthlySavingsDto[];
  readonly last_year: MonthlySavingsDto[];
}

export interface SavingsSummaryResponseDto {
  readonly user_id: number;
  readonly year: number;
  readonly summary: SavingsSummaryDataDto;
}

interface RawMonthlySavings {
  readonly transactionYear: string;
  readonly transactionMonth: string;
  readonly amount: string;
  readonly transactionCount: string;
}

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
  ) {}

  async getSavingsSummary(
    userId: number,
    year: number,
  ): Promise<SavingsSummaryResponseDto> {
    try {
      const rows = await this.transactions.manager.transaction(
        'READ COMMITTED',
        async (manager) => manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .innerJoin('transaction.account', 'account')
        .select('YEAR(transaction.transactionDate)', 'transactionYear')
        .addSelect('MONTH(transaction.transactionDate)', 'transactionMonth')
        .addSelect(
          `ROUND(SUM(CASE
            WHEN transaction.type = :revenueType THEN transaction.amount
            WHEN transaction.type = :expenseType THEN -transaction.amount
            ELSE 0
          END), 2)`,
          'amount',
        )
        .addSelect('COUNT(transaction.transactionId)', 'transactionCount')
        .where('account.userId = :userId', { userId })
        .andWhere('account.accountType IN (:...eligibleAccountTypes)', {
          eligibleAccountTypes: [AccountType.CHECKING, AccountType.SAVINGS],
        })
        .andWhere('transaction.status = :completeStatus', {
          completeStatus: TransactionStatus.COMPLETE,
        })
        .andWhere('transaction.transactionDate >= :startDate', {
          startDate: `${year - 1}-01-01`,
        })
        .andWhere('transaction.transactionDate < :endDate', {
          endDate: `${year + 1}-01-01`,
        })
        .setParameters({
          revenueType: TransactionType.REVENUE,
          expenseType: TransactionType.EXPENSE,
        })
        .groupBy('YEAR(transaction.transactionDate)')
        .addGroupBy('MONTH(transaction.transactionDate)')
        .orderBy('YEAR(transaction.transactionDate)', 'ASC')
        .addOrderBy('MONTH(transaction.transactionDate)', 'ASC')
        .getRawMany<RawMonthlySavings>(),
      );

      return {
        user_id: userId,
        year,
        summary: {
          this_year: this.buildMonthlySeries(rows, year),
          last_year: this.buildMonthlySeries(rows, year - 1),
        },
      };
    } catch {
      throw new InternalServerErrorException(
        'An internal server error occurred while processing the savings summary.',
      );
    }
  }

  private buildMonthlySeries(
    rows: readonly RawMonthlySavings[],
    year: number,
  ): MonthlySavingsDto[] {
    const monthlyValues = new Map<number, RawMonthlySavings>();
    for (const row of rows) {
      if (Number(row.transactionYear) === year) {
        monthlyValues.set(Number(row.transactionMonth), row);
      }
    }

    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const isFutureMonth =
        year === new Date().getFullYear() &&
        monthNumber > new Date().getMonth() + 1;
      const row = isFutureMonth ? undefined : monthlyValues.get(monthNumber);
      const amount = row ? Number(row.amount) : 0;
      return {
        month: String(monthNumber).padStart(2, '0'),
        amount: Object.is(amount, -0) ? 0 : amount,
        transaction_count: row ? Number(row.transactionCount) : 0,
      };
    });
  }
}
