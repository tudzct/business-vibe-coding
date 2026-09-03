import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { AccountType } from '../account.entity';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'bank_name must contain a non-whitespace character' })
  readonly bank_name!: string;

  @IsEnum(AccountType)
  readonly account_type!: AccountType;

  @IsOptional()
  @IsString()
  readonly branch_name?: string | null;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'account_number_full must contain a non-whitespace character' })
  @Matches(/^\d{8,34}$/, { message: 'account_number_full must contain 8-34 digits' })
  readonly account_number_full!: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly balance!: number;
}
