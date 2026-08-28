import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable20260827113000 implements MigrationInterface {
  name = 'CreateUsersTable20260827113000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'full_name', type: 'varchar', length: '25' },
        { name: 'email', type: 'varchar', length: '255' },
        { name: 'username', type: 'varchar', length: '255' },
        { name: 'password_hash', type: 'char', length: '60' },
        { name: 'total_balance', type: 'decimal', precision: 19, scale: 4, default: '0.0000' },
      ],
      indices: [
        { name: 'uq_users_email', columnNames: ['email'], isUnique: true },
        { name: 'uq_users_username', columnNames: ['username'], isUnique: true },
      ],
    }), true);
    await queryRunner.query('ALTER TABLE `users` ADD CONSTRAINT `chk_users_email_normalized` CHECK (`email` = LOWER(TRIM(`email`)))');
    await queryRunner.query('ALTER TABLE `users` ADD CONSTRAINT `chk_users_full_name_length` CHECK (CHAR_LENGTH(`full_name`) BETWEEN 4 AND 25)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
