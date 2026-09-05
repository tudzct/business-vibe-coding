import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account, AccountType } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  TransactionFilterType,
  TransactionListQueryDto,
} from './dto/transaction-list-query.dto';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './transaction.entity';

export interface TransactionResponseDto {
  readonly transaction_id: number;
  readonly account_id: number;
  readonly transaction_date: string;
  readonly type: string;
  readonly item_description: string;
  readonly shop_name: string;
  readonly amount: number;
  readonly payment_method: string;
  readonly status: string;
}

export interface TransactionListResponseDto {
  readonly data: TransactionResponseDto[];
  readonly total: number;
  readonly hasMore: boolean;
}

export interface CreateTransactionDataDto {
  readonly transactionId: number;
  readonly accountId: number;
  readonly transactionDate: string;
  readonly type: TransactionType;
  readonly itemDescription: string;
  readonly shopName: string;
  readonly amount: number;
  readonly paymentMethod: string;
  readonly status: TransactionStatus;
  readonly receiptId: string | null;
  readonly createdAt: string;
  readonly category_id: number | null;
}

const TRANSACTION_ACCOUNT_TYPES = new Set<AccountType>([
  AccountType.CHECKING,
  AccountType.SAVINGS,
  AccountType.CREDIT_CARD,
]);

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    dto: CreateTransactionDto,
  ): Promise<CreateTransactionDataDto> {
    try {
      this.validateTransactionDate(dto.transactionDate);
      if (dto.paymentMethod === 'Cash' && dto.amount > 50_000_000) {
        throw new BadRequestException('Invalid or missing transaction data');
      }

      return await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const user = await manager.findOne(User, {
          where: { userId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!user) {
          throw new BadRequestException('Invalid or missing transaction data');
        }

        const account = await manager.findOne(Account, {
          where: { accountId: dto.accountId, userId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!account || !TRANSACTION_ACCOUNT_TYPES.has(account.accountType)) {
          throw new BadRequestException('Invalid or missing transaction data');
        }

        if (dto.type === TransactionType.EXPENSE) {
          const remainingBalance = Number(account.balance) - dto.amount;
          const minimumBalance =
            account.accountType === AccountType.SAVINGS ? 50_000 : 0;
          if (remainingBalance < minimumBalance) {
            throw new BadRequestException('Invalid or missing transaction data');
          }
        }

        const categoryId = dto.category_id ?? null;
        if (categoryId !== null) {
          const categoryExists = await manager.existsBy(Category, { categoryId });
          if (!categoryExists) {
            throw new BadRequestException('Invalid or missing transaction data');
          }
        }

        const status = dto.status ?? TransactionStatus.COMPLETE;
        if (status === TransactionStatus.COMPLETE) {
          const balanceDelta =
            dto.type === TransactionType.REVENUE ? dto.amount : -dto.amount;
          account.balance = this.roundCurrency(
            Number(account.balance) + balanceDelta,
          );
          user.totalBalance = this.roundCurrency(
            Number(user.totalBalance) + balanceDelta,
          );
          await manager.save(Account, account);
          await manager.save(User, user);
        }

        const entity = manager.create(Transaction, {
          accountId: account.accountId,
          transactionDate: new Date(`${dto.transactionDate}T00:00:00.000Z`),
          type: dto.type,
          itemDescription: dto.itemDescription,
          categoryId,
          shopName: dto.shopName,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          status,
          receiptId: null,
        });
        const saved = await manager.save(Transaction, entity);

        return {
          transactionId: saved.transactionId,
          accountId: saved.accountId,
          transactionDate: this.toIsoDateTime(saved.transactionDate),
          type: saved.type,
          itemDescription: saved.itemDescription,
          shopName: saved.shopName ?? '',
          amount: Number(saved.amount),
          paymentMethod: saved.paymentMethod ?? '',
          status: saved.status,
          receiptId:
            saved.receiptId === null ? null : String(saved.receiptId),
          createdAt: new Date().toISOString(),
          category_id: saved.categoryId,
        };
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error when creating transaction. Try it again later.',
      );
    }
  }

  async findAllByUserId(
    userId: number,
    query: TransactionListQueryDto,
  ): Promise<TransactionListResponseDto> {
    try {
      const builder = this.transactions
        .createQueryBuilder('transaction')
        .innerJoin('transaction.account', 'account')
        .where('account.userId = :userId', { userId });

      if (query.type !== TransactionFilterType.ALL) {
        builder.andWhere('transaction.type = :type', { type: query.type });
      }

      builder.andWhere(
        '(transaction.status <> :failedStatus OR transaction.transactionDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))',
        { failedStatus: TransactionStatus.FAILED },
      );

      const total = await builder.getCount();
      const effectiveLimit = Math.min(query.limit, 50);
      const entities = await builder
        .addSelect(
          'CASE WHEN transaction.status = :pendingStatus THEN 0 ELSE 1 END',
          'statusPriority',
        )
        .setParameter('pendingStatus', TransactionStatus.PENDING)
        .orderBy('statusPriority', 'ASC')
        .addOrderBy('transaction.transactionDate', 'DESC')
        .addOrderBy('transaction.transactionId', 'DESC')
        .skip(query.offset)
        .take(effectiveLimit)
        .getMany();
      const data = entities.map((transaction) => this.toResponse(transaction));

      return {
        data,
        total,
        hasMore: query.offset + data.length < total,
      };
    } catch {
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi hệ thống khi lấy danh sách giao dịch. Vui lòng thử lại sau.',
      );
    }
  }

  private toResponse(transaction: Transaction): TransactionResponseDto {
    const date =
      transaction.transactionDate instanceof Date
        ? transaction.transactionDate.toISOString().slice(0, 10)
        : String(transaction.transactionDate);

    const absoluteAmount = Math.abs(Number(transaction.amount));
    const amount =
      transaction.status === TransactionStatus.COMPLETE &&
      transaction.type === TransactionType.EXPENSE
        ? -absoluteAmount
        : absoluteAmount;
    const shopName =
      transaction.status === TransactionStatus.PENDING &&
      transaction.paymentMethod === 'Credit Card'
        ? '***'
        : (transaction.shopName ?? '');

    return {
      transaction_id: transaction.transactionId,
      account_id: transaction.accountId,
      transaction_date: date,
      type: transaction.type,
      item_description: transaction.itemDescription,
      shop_name: shopName,
      amount,
      payment_method: transaction.paymentMethod ?? '',
      status: transaction.status,
    };
  }

  private toIsoDateTime(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
    return date.toISOString();
  }

  private validateTransactionDate(value: string): void {
    const transactionDate = new Date(`${value}T00:00:00.000Z`).getTime();
    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const earliest = today - 365 * dayInMilliseconds;
    const latest = today + dayInMilliseconds;

    if (transactionDate < earliest || transactionDate > latest) {
      throw new BadRequestException('Invalid or missing transaction data');
    }
  }

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }
}
