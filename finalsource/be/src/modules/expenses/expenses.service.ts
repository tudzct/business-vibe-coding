import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transaction/transaction.entity';
import type { ExpenseSummaryItem } from './expense-summary.types';

interface MonthlyExpenseRow {
  monthNumber: string | number;
  totalExpense: string | number;
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
  ) {}

  async getExpenseSummary(userId: number): Promise<ExpenseSummaryItem[]> {
    try {
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const nextYearStart = `${currentYear + 1}-01-01`;
      const rows = await this.transactions
        .createQueryBuilder('transaction')
        .innerJoin('transaction.account', 'account')
        .select('MONTH(transaction.transactionDate)', 'monthNumber')
        .addSelect('SUM(transaction.amount)', 'totalExpense')
        .where('account.userId = :userId', { userId })
        .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('transaction.transactionDate >= :yearStart', { yearStart })
        .andWhere('transaction.transactionDate < :nextYearStart', {
          nextYearStart,
        })
        .groupBy('MONTH(transaction.transactionDate)')
        .orderBy('monthNumber', 'ASC')
        .getRawMany<MonthlyExpenseRow>();

      return rows.map((row) => {
        const month = monthNames[Number(row.monthNumber) - 1];
        const totalExpense = Number(row.totalExpense);
        if (!month || !Number.isFinite(totalExpense)) {
          throw new Error('Invalid expense aggregation result');
        }
        return { month, totalExpense };
      });
    } catch {
      throw new InternalServerErrorException('Không thể lấy dữ liệu chi tiêu.');
    }
  }
}
