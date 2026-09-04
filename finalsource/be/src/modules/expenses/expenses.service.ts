import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transaction/transaction.entity';
import type {
  BreakdownResult,
  ExpenseSubCategory,
} from './expense-breakdown.types';
import type { ExpenseSummaryItem } from './expense-summary.types';

interface MonthlyExpenseRow {
  monthNumber: string | number;
  totalExpense: string | number;
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

interface MonthBounds {
  start: string;
  end: string;
  previousStart: string;
}

interface BreakdownAccumulator {
  total: number;
  subCategories: ExpenseSubCategory[];
}

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

  async getExpensesBreakdown(
    userId: number,
    month: string,
  ): Promise<BreakdownResult[]> {
    try {
      const bounds = this.getMonthBounds(month);
      const [currentTransactions, previousTransactions] = await Promise.all([
        this.findExpenseTransactions(userId, bounds.start, bounds.end),
        this.findExpenseTransactions(userId, bounds.previousStart, bounds.start),
      ]);

      if (currentTransactions.length === 0) {
        throw new NotFoundException('Không có dữ liệu chi tiêu cho tháng này.');
      }

      const previousTotals = new Map<string, number>();
      for (const transaction of previousTransactions) {
        const category = this.getCategoryLabel(transaction);
        previousTotals.set(
          category,
          (previousTotals.get(category) ?? 0) + Number(transaction.amount),
        );
      }

      const currentGroups = new Map<string, BreakdownAccumulator>();
      for (const transaction of currentTransactions) {
        const category = this.getCategoryLabel(transaction);
        const amount = Number(transaction.amount);
        const group = currentGroups.get(category) ?? {
          total: 0,
          subCategories: [],
        };
        group.total += amount;
        group.subCategories.push({
          item_description: transaction.itemDescription,
          amount,
          date: this.toIsoDate(transaction.transactionDate),
        });
        currentGroups.set(category, group);
      }

      return Array.from(currentGroups, ([category, group]) => {
        const previousTotal = previousTotals.get(category) ?? 0;
        const changePercent =
          previousTotal === 0
            ? group.total > 0
              ? 100
              : null
            : ((group.total - previousTotal) / previousTotal) * 100;
        return {
          category,
          total: this.round2(group.total),
          changePercent:
            changePercent === null ? null : this.round2(changePercent),
          subCategories: group.subCategories,
        };
      }).sort(
        (left, right) =>
          right.total - left.total || left.category.localeCompare(right.category),
      );
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lấy dữ liệu breakdown chi tiêu.',
      );
    }
  }

  private findExpenseTransactions(
    userId: number,
    start: string,
    end: string,
  ): Promise<Transaction[]> {
    return this.transactions
      .createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.transactionDate >= :start', { start })
      .andWhere('transaction.transactionDate < :end', { end })
      .orderBy('transaction.transactionDate', 'ASC')
      .addOrderBy('transaction.transactionId', 'ASC')
      .getMany();
  }

  private getMonthBounds(month: string): MonthBounds {
    const [yearPart, monthPart] = month.split('-');
    const year = Number(yearPart);
    const monthNumber = Number(monthPart);
    const nextYear = monthNumber === 12 ? year + 1 : year;
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    const previousYear = monthNumber === 1 ? year - 1 : year;
    const previousMonth = monthNumber === 1 ? 12 : monthNumber - 1;

    return {
      start: `${yearPart}-${monthPart}-01`,
      end: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
      previousStart: `${previousYear}-${String(previousMonth).padStart(2, '0')}-01`,
    };
  }

  private getCategoryLabel(transaction: Transaction): string {
    if (transaction.category) {
      return transaction.category.categoryName;
    }
    return transaction.categoryId === null ? 'Uncategorized' : 'Unknown';
  }

  private round2(value: number): number {
    return Math.round((value + Math.sign(value) * Number.EPSILON) * 100) / 100;
  }

  private toIsoDate(value: Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid transaction date');
    }
    return date.toISOString().slice(0, 10);
  }
}
