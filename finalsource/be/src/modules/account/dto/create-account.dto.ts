import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
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
  readonly account_number_full!: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  readonly balance!: number;
}
