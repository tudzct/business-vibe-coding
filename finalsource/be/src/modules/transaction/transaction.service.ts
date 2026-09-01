import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction, TransactionStatus, TransactionType } from './transaction.entity';

export interface CreatedTransactionPayload {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  type: TransactionType;
  itemDescription: string;
  shopName: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  receiptId: number | null;
  createdAt: string;
  category_id: number | null;
}

@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  async create(userId: number, dto: CreateTransactionDto): Promise<CreatedTransactionPayload> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const account = await manager.getRepository(Account).findOne({
          where: { accountId: dto.accountId, userId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!account) {
          throw new BadRequestException('Account does not exist or is not owned by the authenticated user.');
        }

        if (dto.category_id !== undefined && dto.category_id !== null) {
          const category = await manager.getRepository(Category).findOne({
            where: { categoryId: dto.category_id },
          });
          if (!category) {
            throw new BadRequestException('Category does not exist.');
          }
        }

        const currentBalance = Number(account.balance);
        if (dto.type === TransactionType.EXPENSE && currentBalance < dto.amount) {
          throw new BadRequestException('Insufficient account balance.');
        }

        const transactionRepository = manager.getRepository(Transaction);
        const transaction = transactionRepository.create({
          accountId: dto.accountId,
          transactionDate: new Date(`${dto.transactionDate}T00:00:00.000Z`),
          type: dto.type,
          itemDescription: dto.itemDescription.trim(),
          categoryId: dto.category_id ?? null,
          shopName: dto.shopName.trim(),
          amount: dto.amount,
          paymentMethod: dto.paymentMethod.trim(),
          status: dto.status ?? TransactionStatus.COMPLETE,
          receiptId: null,
        });
        const created = await transactionRepository.save(transaction);

        account.balance =
          dto.type === TransactionType.REVENUE
            ? currentBalance + dto.amount
            : currentBalance - dto.amount;
        await manager.getRepository(Account).save(account);

        return {
          transactionId: created.transactionId,
          accountId: created.accountId,
          transactionDate: new Date(created.transactionDate).toISOString(),
          type: created.type,
          itemDescription: created.itemDescription,
          shopName: created.shopName,
          amount: Number(created.amount),
          paymentMethod: created.paymentMethod,
          status: created.status,
          receiptId: null,
          createdAt: new Date().toISOString(),
          category_id: created.categoryId ?? null,
        };
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error when creating transaction. Try it again later.');
    }
  }
}
