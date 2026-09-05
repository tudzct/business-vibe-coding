import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../account.entity';
import {
  TransactionStatus,
  TransactionType,
} from '../../transaction/transaction.entity';

export class TransactionDto {
  @ApiProperty({ example: '2025-11-01' })
  readonly date!: string;

  @ApiProperty({ example: 150000 })
  readonly amount!: number;

  @ApiProperty({ example: 'Movie Ticket' })
  readonly description!: string;

  @ApiProperty({ enum: TransactionStatus })
  readonly status!: TransactionStatus;

  @ApiProperty({ example: null, nullable: true })
  readonly receipt_id!: string | null;

  @ApiProperty({ enum: TransactionType })
  readonly type!: TransactionType;
}

export class AccountDetailResponseDto {
  @ApiProperty({ example: 3 })
  readonly id!: number;

  @ApiProperty({ example: 'Vietcombank' })
  readonly bank_name!: string;

  @ApiProperty({ enum: AccountType })
  readonly account_type!: AccountType;

  @ApiProperty({ example: 'Hanoi Branch', nullable: true })
  readonly branch_name!: string | null;

  @ApiProperty({ example: '9704221234567890123' })
  readonly account_number_full!: string;

  @ApiProperty({ example: 4500000 })
  readonly balance!: number;

  @ApiProperty({ type: [TransactionDto] })
  readonly recent_transactions!: TransactionDto[];
}
