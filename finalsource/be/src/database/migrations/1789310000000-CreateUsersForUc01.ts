import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersForUc011789310000000 implements MigrationInterface {
  name = 'CreateUsersForUc011789310000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const legacy = await queryRunner.getTable('Users');
    if (legacy) throw new Error('Legacy Users table requires a separate data-preserving migration');
    const current = await queryRunner.getTable('users');
    if (current) {
      const required = ['id', 'full_name', 'email', 'password_hash'];
      if (!required.every((name) => current.findColumnByName(name))) {
        throw new Error('Existing users table does not match approved UC-01 schema');
      }
      const uniqueEmail = current.indices.some(
        (index) => index.isUnique && index.columnNames.length === 1 && index.columnNames[0] === 'email',
      );
      if (!uniqueEmail) throw new Error('Existing users table lacks unique email constraint');
      return;
    }

    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'full_name', type: 'varchar', length: '255', isNullable: false },
        { name: 'email', type: 'varchar', length: '255', isNullable: false },
        { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
      ],
    }));
    await queryRunner.createIndex('users', new TableIndex({ name: 'uq_users_email', columnNames: ['email'], isUnique: true }));
  }

  down(): Promise<void> {
    throw new Error('Rollback requires read-only verification that this migration created an empty users table with no dependents');
  }
}
