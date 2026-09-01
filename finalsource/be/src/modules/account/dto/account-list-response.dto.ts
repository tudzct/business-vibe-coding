import { AccountType } from '../account.entity';

export class AccountListItemDto {
  id!: number;
  bank_name!: string;
  account_type!: AccountType;
  branch_name!: string | null;
  account_number_last_4!: string;
  balance!: number;
}

export class AccountListDataDto {
  user_id!: number;
  accounts!: AccountListItemDto[];
}
