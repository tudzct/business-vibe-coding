import { Transform } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';

export enum TransactionFilterType {
  ALL = 'All',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export class TransactionListQueryDto {
  @IsEnum(TransactionFilterType)
  readonly type!: TransactionFilterType;

  @Transform(({ value }) => (value === undefined ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  readonly limit: number = 10;

  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsInt()
  @Min(0)
  readonly offset: number = 0;
}
