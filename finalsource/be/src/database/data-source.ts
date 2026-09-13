import { DataSource } from 'typeorm';
import { User } from '../modules/user/user.entity';
import { Account } from '../modules/account/account.entity';
import { Bill } from '../modules/bill/bill.entity';
import { Goal } from '../modules/goal/goal.entity';
import { Category } from '../modules/category/category.entity';
import { Transaction } from '../modules/transaction/transaction.entity';
import { CreateUsersForUc011789310000000 } from './migrations/1789310000000-CreateUsersForUc01';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export default new DataSource({
  type: 'mysql',
  host: required('DB_HOST'),
  port: Number(process.env.DB_PORT || '3306'),
  username: required('DB_USERNAME'),
  password: required('DB_PASSWORD'),
  database: required('DB_DATABASE'),
  entities: [User, Account, Bill, Goal, Category, Transaction],
  migrations: [CreateUsersForUc011789310000000],
  synchronize: false,
  logging: false,
});
