import { MigrationInterface, QueryRunner, Table } from 'typeorm';

const MIGRATION_TABLE_COMMENT =
  'Created by CreateCoreTablesIfMissing1700000000000';

const CORE_TABLES_IN_REVERSE_DEPENDENCY_ORDER = [
  'Bills',
  'transactions',
  'accounts',
  'categories',
  'users',
] as const;

export class CreateCoreTablesIfMissing1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('users'))) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
          comment: MIGRATION_TABLE_COMMENT,
          columns: [
            {
              name: 'id',
              type: 'int',
              unsigned: true,
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'full_name', type: 'varchar', length: '25' },
            { name: 'email', type: 'varchar', length: '255' },
            { name: 'username', type: 'varchar', length: '255' },
            { name: 'password_hash', type: 'char', length: '60' },
            {
              name: 'total_balance',
              type: 'decimal',
              precision: 19,
              scale: 4,
              default: 0,
            },
          ],
          uniques: [
            { name: 'UQ_users_email', columnNames: ['email'] },
            { name: 'UQ_users_username', columnNames: ['username'] },
          ],
        }),
        true,
      );
    }

    if (!(await queryRunner.hasTable('categories'))) {
      await queryRunner.createTable(
        new Table({
          name: 'categories',
          comment: MIGRATION_TABLE_COMMENT,
          columns: [
            {
              name: 'category_id',
              type: 'int',
              unsigned: true,
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'category_name', type: 'varchar', length: '255' },
          ],
          uniques: [
            {
              name: 'UQ_categories_category_name',
              columnNames: ['category_name'],
            },
          ],
        }),
        true,
      );
    }

    if (!(await queryRunner.hasTable('accounts'))) {
      await queryRunner.createTable(
        new Table({
          name: 'accounts',
          comment: MIGRATION_TABLE_COMMENT,
          columns: [
            {
              name: 'account_id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'user_id', type: 'int', unsigned: true },
            { name: 'bank_name', type: 'varchar', length: '255' },
            {
              name: 'account_type',
              type: 'enum',
              enum: [
                'Checking',
                'Credit Card',
                'Savings',
                'Investment',
                'Loan',
              ],
            },
            {
              name: 'branch_name',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'account_number_full',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'account_number_last_4',
              type: 'varchar',
              length: '4',
            },
            {
              name: 'balance',
              type: 'decimal',
              precision: 15,
              scale: 2,
              default: 0,
            },
          ],
          foreignKeys: [
            {
              name: 'FK_accounts_user',
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    if (!(await queryRunner.hasTable('transactions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'transactions',
          comment: MIGRATION_TABLE_COMMENT,
          columns: [
            {
              name: 'transaction_id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'account_id', type: 'int' },
            { name: 'transaction_date', type: 'date' },
            {
              name: 'type',
              type: 'enum',
              enum: ['Revenue', 'Expense'],
            },
            {
              name: 'item_description',
              type: 'varchar',
              length: '500',
            },
            {
              name: 'shop_name',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            { name: 'amount', type: 'decimal', precision: 15, scale: 2 },
            {
              name: 'payment_method',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['Complete', 'Pending', 'Failed'],
              default: "'Pending'",
            },
            { name: 'receipt_id', type: 'int', unsigned: true },
            {
              name: 'category_id',
              type: 'int',
              unsigned: true,
              isNullable: true,
            },
          ],
          foreignKeys: [
            {
              name: 'FK_transactions_account',
              columnNames: ['account_id'],
              referencedTableName: 'accounts',
              referencedColumnNames: ['account_id'],
            },
            {
              name: 'FK_transactions_category',
              columnNames: ['category_id'],
              referencedTableName: 'categories',
              referencedColumnNames: ['category_id'],
            },
          ],
        }),
        true,
      );
    }

    if (!(await queryRunner.hasTable('Bills'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Bills',
          comment: MIGRATION_TABLE_COMMENT,
          columns: [
            {
              name: 'bill_id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'user_id', type: 'int', unsigned: true },
            { name: 'due_date', type: 'date' },
            {
              name: 'logo_url',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            {
              name: 'item_description',
              type: 'varchar',
              length: '500',
            },
            { name: 'last_charge_date', type: 'date', isNullable: true },
            { name: 'amount', type: 'decimal', precision: 15, scale: 2 },
          ],
          foreignKeys: [
            {
              name: 'FK_bills_user',
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const createdTables: string[] = [];

    for (const tableName of CORE_TABLES_IN_REVERSE_DEPENDENCY_ORDER) {
      if (!(await queryRunner.hasTable(tableName))) {
        continue;
      }

      const commentResult: unknown = await queryRunner.query(
        'SELECT TABLE_COMMENT AS tableComment FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [tableName],
      );
      if (
        this.readFirstValue(commentResult, 'tableComment') !==
        MIGRATION_TABLE_COMMENT
      ) {
        continue;
      }

      const countResult: unknown = await queryRunner.query(
        `SELECT COUNT(*) AS rowCount FROM \`${tableName}\``,
      );
      const rowCount = Number(
        this.readFirstValue(countResult, 'rowCount') ?? 0,
      );
      if (rowCount > 0) {
        throw new Error(
          `Refusing to drop ${tableName} while persisted rows exist.`,
        );
      }
      createdTables.push(tableName);
    }

    for (const tableName of createdTables) {
      await queryRunner.dropTable(tableName, true, true, true);
    }
  }

  private readFirstValue(result: unknown, key: string): unknown {
    const firstRow: unknown = Array.isArray(result) ? result[0] : undefined;
    return typeof firstRow === 'object' &&
      firstRow !== null &&
      key in firstRow
      ? (firstRow as Record<string, unknown>)[key]
      : undefined;
  }
}
