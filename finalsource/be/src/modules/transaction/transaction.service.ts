import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionDataDto } from './dto/create-transaction-response.dto';
import { TransactionFilterType } from './dto/transaction-list-query.dto';
import {
  TransactionDto,
  TransactionListResponseDto,
} from './dto/transaction-list-response.dto';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './transaction.entity';

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
      return await this.dataSource.transaction('READ COMMITTED', async (manager) => {
        const account = await manager
          .getRepository(Account)
          .createQueryBuilder('account')
          .setLock('pessimistic_write')
          .where('account.accountId = :accountId', { accountId: dto.accountId })
          .andWhere('account.userId = :userId', { userId })
          .getOne();

        if (!account) {
          throw new BadRequestException('Invalid account');
        }

        if (dto.category_id !== undefined && dto.category_id !== null) {
          const category = await manager.getRepository(Category).findOne({
            select: { categoryId: true },
            where: { categoryId: dto.category_id },
          });
          if (!category) {
            throw new BadRequestException('Invalid category');
          }
        }

        const currentBalance = Number(account.balance);
        const amount = Number(dto.amount);
        if (!Number.isFinite(currentBalance) || !Number.isFinite(amount)) {
          throw new BadRequestException('Invalid transaction amount');
        }
        if (dto.type === TransactionType.EXPENSE && currentBalance < amount) {
          throw new BadRequestException('Insufficient account balance');
        }

        const transactionRepository = manager.getRepository(Transaction);
        const transaction = transactionRepository.create({
          accountId: account.accountId,
          transactionDate: new Date(`${dto.transactionDate}T00:00:00.000Z`),
          type: dto.type,
          itemDescription: dto.itemDescription.trim(),
          shopName: dto.shopName.trim(),
          amount,
          paymentMethod: dto.paymentMethod.trim(),
          status: dto.status ?? TransactionStatus.COMPLETE,
          categoryId: dto.category_id ?? undefined,
        });

        const saved = await transactionRepository.save(transaction);
        account.balance =
          dto.type === TransactionType.REVENUE
            ? currentBalance + amount
            : currentBalance - amount;
        await manager.getRepository(Account).save(account);

        return this.toCreateDto(saved);
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
    type: TransactionFilterType,
    limit: number,
    offset: number,
  ): Promise<TransactionListResponseDto> {
    try {
      const query = this.transactions
        .createQueryBuilder('transaction')
        .innerJoin('transaction.account', 'account')
        .where('account.userId = :userId', { userId })
        .orderBy('transaction.transactionDate', 'DESC')
        .skip(offset)
        .take(limit);

      if (type !== TransactionFilterType.ALL) {
        query.andWhere('transaction.type = :type', {
          type:
            type === TransactionFilterType.REVENUE
              ? TransactionType.REVENUE
              : TransactionType.EXPENSE,
        });
      }

      const [rows, total] = await query.getManyAndCount();
      const data = rows.map((transaction) => this.toDto(transaction));

      return {
        data,
        total,
        hasMore: offset + data.length < total,
      };
    } catch {
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi hệ thống khi lấy danh sách giao dịch. Vui lòng thử lại sau.',
      );
    }
  }

  private toDto(transaction: Transaction): TransactionDto {
    return {
      transaction_id: transaction.transactionId,
      account_id: transaction.accountId,
      transaction_date: this.toIsoDate(transaction.transactionDate),
      type: transaction.type,
      item_description: transaction.itemDescription,
      shop_name: transaction.shopName,
      amount: Number(transaction.amount),
      payment_method: transaction.paymentMethod,
      status: transaction.status,
    };
  }

  private toCreateDto(transaction: Transaction): CreateTransactionDataDto {
    const transactionDate =
      transaction.transactionDate instanceof Date
        ? transaction.transactionDate.toISOString()
        : new Date(`${String(transaction.transactionDate).slice(0, 10)}T00:00:00.000Z`).toISOString();

    return {
      transactionId: transaction.transactionId,
      accountId: transaction.accountId,
      transactionDate,
      type: transaction.type,
      itemDescription: transaction.itemDescription,
      shopName: transaction.shopName,
      amount: Number(transaction.amount),
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      receiptId: transaction.receiptId ?? null,
      createdAt: new Date().toISOString(),
      category_id: transaction.categoryId ?? null,
    };
  }

  private toIsoDate(value: Date): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
