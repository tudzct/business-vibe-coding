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

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  accountId!: number;

  @IsDateString({ strict: true })
  transactionDate!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  itemDescription!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number | null;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  shopName!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
