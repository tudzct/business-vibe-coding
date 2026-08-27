import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable20260827113000 implements MigrationInterface {
  name = 'CreateUsersTable20260827113000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', unsigned: true, isNullable: false, isPrimary: true, isGenerated: true, generationStrategy: 'increment', primaryKeyConstraintName: 'pk_users' },
        { name: 'full_name', type: 'varchar', length: '25', isNullable: false, charset: 'utf8mb4' },
        { name: 'email', type: 'varchar', length: '255', isNullable: false, charset: 'utf8mb4', collation: 'utf8mb4_0900_ai_ci' },
        { name: 'username', type: 'varchar', length: '255', isNullable: false, charset: 'utf8mb4', collation: 'utf8mb4_0900_ai_ci' },
        { name: 'password_hash', type: 'char', length: '60', isNullable: false, charset: 'ascii', collation: 'ascii_bin' },
        { name: 'total_balance', type: 'decimal', precision: 19, scale: 4, isNullable: false, default: '0.0000' },
      ],
    }), true);
    const table = await queryRunner.getTable('users');
    if (!table) throw new Error('users table was not created');
    if (!table.indices.some((index) => index.name === 'uq_users_email')) {
      await queryRunner.createIndex('users', new TableIndex({ name: 'uq_users_email', columnNames: ['email'], isUnique: true }));
    }
    if (!table.indices.some((index) => index.name === 'uq_users_username')) {
      await queryRunner.createIndex('users', new TableIndex({ name: 'uq_users_username', columnNames: ['username'], isUnique: true }));
    }
    await this.ensureCheck(queryRunner, 'chk_users_email_normalized', 'email = LOWER(TRIM(email))');
    await this.ensureCheck(queryRunner, 'chk_users_full_name_length', 'CHAR_LENGTH(full_name) BETWEEN 4 AND 25');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true, true, true);
  }

  private async ensureCheck(queryRunner: QueryRunner, name: string, expression: string): Promise<void> {
    const result: unknown = await queryRunner.query(
      `SELECT COUNT(*) AS constraint_count FROM information_schema.table_constraints
       WHERE table_schema = DATABASE() AND table_name = 'users' AND constraint_name = ? AND constraint_type = 'CHECK'`,
      [name],
    );
    let exists = false;
    if (Array.isArray(result) && result.length > 0) {
      const row: unknown = result[0];
      if (typeof row === 'object' && row !== null && 'constraint_count' in row) {
        const value = (row as Record<string, unknown>).constraint_count;
        exists = Number(value) > 0;
      }
    }
    if (!exists) await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`${name}\` CHECK (${expression})`);
  }
}
