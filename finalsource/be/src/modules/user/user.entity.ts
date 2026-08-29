import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { Bill } from '../bill/bill.entity';
import { Goal } from '../goal/goal.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 25 })
  fullName!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'username', type: 'varchar', length: 255, unique: true })
  username!: string;

  @Column({
    name: 'password_hash',
    type: 'char',
    length: 60,
    charset: 'ascii',
    collation: 'ascii_bin',
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'total_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: '0.0000',
  })
  totalBalance!: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Bill, (bill) => bill.user)
  bills!: Bill[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals!: Goal[];
}
