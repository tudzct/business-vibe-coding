import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TransactionStatus, TransactionType } from '../transaction.entity';

const trimRequiredText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto {
  @Type(() => Number)
  @IsInt()
  readonly accountId!: number;

  @IsDateString({ strict: true })
  readonly transactionDate!: string;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @IsString()
  @Transform(({ value }) => trimRequiredText(value))
  @IsNotEmpty()
  readonly itemDescription!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly category_id?: number | null;

  @IsString()
  @Transform(({ value }) => trimRequiredText(value))
  @IsNotEmpty()
  readonly shopName!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0.01)
  readonly amount!: number;

  @IsString()
  @Transform(({ value }) => trimRequiredText(value))
  @IsNotEmpty()
  readonly paymentMethod!: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus;
}
