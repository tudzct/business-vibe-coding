import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@Index('uq_users_email', ['email'], { unique: true })
@Index('uq_users_username', ['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id', primaryKeyConstraintName: 'pk_users' })
  id!: number;

  @Column({ type: 'varchar', length: 25, name: 'full_name' })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'username' })
  username!: string;

  @Column({ type: 'char', length: 60, name: 'password_hash', select: false })
  passwordHash!: string;

  @Column({ type: 'decimal', precision: 19, scale: 4, name: 'total_balance', default: '0.0000' })
  totalBalance!: string;
}
