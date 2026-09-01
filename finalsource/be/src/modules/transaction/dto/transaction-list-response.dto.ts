import { TransactionStatus, TransactionType } from '../transaction.entity';

export class TransactionDto {
  transaction_id!: number;
  account_id!: number;
  transaction_date!: string;
  type!: TransactionType;
  item_description!: string;
  shop_name!: string;
  amount!: number;
  payment_method!: string;
  status!: TransactionStatus;
}

export class TransactionListResponseDto {
  data!: TransactionDto[];
  total!: number;
  hasMore!: boolean;
}
