import { Check, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@Index('uq_users_email', ['email'], { unique: true })
@Index('uq_users_username', ['username'], { unique: true })
@Check('chk_users_email_normalized', 'email = LOWER(TRIM(email))')
@Check('chk_users_full_name_length', 'CHAR_LENGTH(full_name) BETWEEN 4 AND 25')
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true, primaryKeyConstraintName: 'pk_users' })
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 25 })
  fullName!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, collation: 'utf8mb4_0900_ai_ci' })
  email!: string;

  @Column({ name: 'username', type: 'varchar', length: 255, collation: 'utf8mb4_0900_ai_ci' })
  username!: string;

  @Column({ name: 'password_hash', type: 'char', length: 60, charset: 'ascii', collation: 'ascii_bin', select: false })
  passwordHash!: string;

  @Column({ name: 'total_balance', type: 'decimal', precision: 19, scale: 4, default: '0.0000' })
  totalBalance!: string;
}
