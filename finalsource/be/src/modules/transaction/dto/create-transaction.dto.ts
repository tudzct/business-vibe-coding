import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TransactionStatus, TransactionType } from '../transaction.entity';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly accountId!: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly transactionDate!: string;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  readonly itemDescription!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly category_id?: number | null;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  readonly shopName!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  readonly amount!: number;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  readonly paymentMethod!: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus;
}
