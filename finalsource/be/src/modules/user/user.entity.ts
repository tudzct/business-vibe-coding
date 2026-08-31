import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { Bill } from '../bill/bill.entity';
import { Goal } from '../goal/goal.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  userId!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 25 })
  fullName!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  username!: string | null;

  @Column({ name: 'password_hash', type: 'char', length: 60 })
  password!: string;

  @Column({
    name: 'total_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
  })
  totalBalance!: number;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Bill, (bill) => bill.user)
  bills!: Bill[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals!: Goal[];

//   @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
//   updatedAt: Date;
}
