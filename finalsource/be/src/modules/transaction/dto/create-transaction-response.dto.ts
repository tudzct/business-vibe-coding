import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '../transaction.entity';

export class CreateTransactionDataDto {
  @ApiProperty()
  transactionId!: number;

  @ApiProperty()
  accountId!: number;

  @ApiProperty({ format: 'date-time' })
  transactionDate!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty()
  itemDescription!: string;

  @ApiProperty()
  shopName!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  paymentMethod!: string;

  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;

  @ApiProperty({ nullable: true })
  receiptId!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ nullable: true })
  category_id!: number | null;
}

export class CreateTransactionResponseDto {
  @ApiProperty({ example: 'Transaction created successfully' })
  message!: string;

  @ApiProperty({ type: CreateTransactionDataDto })
  data!: CreateTransactionDataDto;
}
