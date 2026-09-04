import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

const indexName = 'uq_accounts_user_id_account_number_full';

export class AddAccountsOwnerAccountNumberUnique1788495106545 implements MigrationInterface {
  name = 'AddAccountsOwnerAccountNumberUnique1788495106545';

  async up(queryRunner: QueryRunner): Promise<void> {
    const duplicateQueryResult: unknown = await queryRunner.query(`
      SELECT 1
      FROM (
        SELECT user_id, account_number_full
        FROM Accounts
        GROUP BY user_id, account_number_full
        HAVING COUNT(*) > 1
        LIMIT 1
      ) duplicate_groups
    `);

    if (!Array.isArray(duplicateQueryResult)) {
      throw new Error('Could not validate existing account-number uniqueness.');
    }

    if (duplicateQueryResult.length > 0) {
      throw new Error('Cannot add the owner/account-number unique constraint while duplicate groups exist.');
    }

    await queryRunner.createIndex(
      'Accounts',
      new TableIndex({
        name: indexName,
        columnNames: ['user_id', 'account_number_full'],
        isUnique: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('Accounts', indexName);
  }
}
