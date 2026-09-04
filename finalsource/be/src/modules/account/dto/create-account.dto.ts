import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { AccountType } from '../account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Vietcombank' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly bank_name!: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  readonly account_type!: AccountType;

  @ApiPropertyOptional({ nullable: true, example: 'Hanoi Branch' })
  @ValidateIf(
    (dto: CreateAccountDto) =>
      dto.account_type === AccountType.LOAN ||
      dto.account_type === AccountType.INVESTMENT ||
      (dto.branch_name !== undefined && dto.branch_name !== null),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly branch_name?: string | null;

  @ApiProperty({ example: '9704221234567890123', minLength: 8, maxLength: 34 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'account_number_full must contain only digits' })
  @Length(8, 34)
  readonly account_number_full!: string;

  @ApiProperty({ example: 4500000, minimum: 0, type: Number })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly balance!: number;
}
