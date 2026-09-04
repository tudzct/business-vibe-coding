import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

interface DuplicateGroupCountRow {
  duplicateGroupCount: string | number;
}

export class AddAccountsOwnerAccountNumberUnique1788495106545
  implements MigrationInterface
{
  name = 'AddAccountsOwnerAccountNumberUnique1788495106545';

  async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`
      SELECT COUNT(*) AS duplicateGroupCount
      FROM (
        SELECT 1
        FROM accounts
        GROUP BY user_id, account_number_full
        HAVING COUNT(*) > 1
      ) AS duplicateGroups
    `)) as DuplicateGroupCountRow[];
    const duplicateGroupCount = Number(rows[0]?.duplicateGroupCount ?? 0);

    if (duplicateGroupCount > 0) {
      throw new Error(
        `Cannot add owner/account-number uniqueness: ${duplicateGroupCount} duplicate group(s) require researcher-approved data resolution.`,
      );
    }

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'uq_accounts_user_id_account_number_full',
        columnNames: ['user_id', 'account_number_full'],
        isUnique: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('accounts');
    const index = table?.indices.find(
      (candidate) =>
        candidate.name === 'uq_accounts_user_id_account_number_full',
    );

    if (index) {
      await queryRunner.dropIndex('accounts', index);
    }
  }
}
