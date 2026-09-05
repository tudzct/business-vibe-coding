import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
} from 'typeorm';

const TABLE_COMMENT =
  'Created by MakeTransactionsReceiptIdNullable20260901101931';

interface ExpectedColumn {
  readonly name: string;
  readonly type: string;
  readonly unsigned?: boolean;
  readonly nullable: boolean;
}

export class MakeTransactionsReceiptIdNullable20260901101931
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.getTable('users');
    if (!users) {
      throw new Error(
        'Cannot recover the UC-13 schema baseline because users is absent.',
      );
    }
    this.assertColumns('users', users, [
      { name: 'id', type: 'int', unsigned: true, nullable: false },
    ]);

    const categories = await queryRunner.getTable('categories');
    const accounts = await queryRunner.getTable('accounts');
    const transactions = await queryRunner.getTable('transactions');

    if (categories) this.assertCategoriesCompatible(categories);
    if (accounts) this.assertAccountsCompatible(accounts);
    if (transactions) this.assertTransactionsCompatible(transactions);

    if (!categories) {
      await queryRunner.createTable(
        new Table({
          name: 'categories',
          comment: TABLE_COMMENT,
          columns: [
            {
              name: 'category_id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'category_name',
              type: 'varchar',
              length: '255',
              isUnique: true,
            },
          ],
        }),
        true,
      );
    }

    if (!accounts) {
      await queryRunner.createTable(
        new Table({
          name: 'accounts',
          comment: TABLE_COMMENT,
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
              default: '0.00',
            },
          ],
          foreignKeys: [
            {
              name: 'FK_accounts_user',
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'NO ACTION',
              onUpdate: 'NO ACTION',
            },
          ],
          indices: [
            {
              name: 'uq_accounts_user_id_account_number_full',
              columnNames: ['user_id', 'account_number_full'],
              isUnique: true,
            },
            {
              name: 'IDX_accounts_user_id',
              columnNames: ['user_id'],
            },
          ],
        }),
        true,
      );
    }

    if (!transactions) {
      await queryRunner.createTable(
        new Table({
          name: 'transactions',
          comment: TABLE_COMMENT,
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
            {
              name: 'amount',
              type: 'decimal',
              precision: 15,
              scale: 2,
            },
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
            {
              name: 'receipt_id',
              type: 'int',
              unsigned: true,
              isNullable: true,
            },
            {
              name: 'category_id',
              type: 'int',
              isNullable: true,
            },
          ],
          foreignKeys: [
            {
              name: 'FK_transactions_account',
              columnNames: ['account_id'],
              referencedTableName: 'accounts',
              referencedColumnNames: ['account_id'],
              onDelete: 'NO ACTION',
              onUpdate: 'NO ACTION',
            },
            {
              name: 'FK_transactions_category',
              columnNames: ['category_id'],
              referencedTableName: 'categories',
              referencedColumnNames: ['category_id'],
              onDelete: 'NO ACTION',
              onUpdate: 'NO ACTION',
            },
          ],
          indices: [
            {
              name: 'IDX_transactions_account_date',
              columnNames: ['account_id', 'transaction_date'],
            },
          ],
        }),
        true,
      );
      return;
    }

    const receiptId = transactions.findColumnByName('receipt_id');
    if (receiptId?.isNullable) return;

    await queryRunner.changeColumn(
      'transactions',
      'receipt_id',
      new TableColumn({
        name: 'receipt_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const createdByThisMigration = {
      transactions: await this.hasMigrationComment(queryRunner, 'transactions'),
      accounts: await this.hasMigrationComment(queryRunner, 'accounts'),
      categories: await this.hasMigrationComment(queryRunner, 'categories'),
    };

    for (const tableName of ['transactions', 'accounts', 'categories'] as const) {
      if (
        createdByThisMigration[tableName]
        && await this.tableHasRows(queryRunner, tableName)
      ) {
        throw new Error(
          `Refusing to drop ${tableName} because it contains persisted rows.`,
        );
      }
    }

    if (createdByThisMigration.transactions) {
      await queryRunner.dropTable('transactions', true, true, true);
    } else if (await queryRunner.hasTable('transactions')) {
      const result: unknown = await queryRunner.query(
        'SELECT COUNT(*) AS count FROM `transactions` WHERE `receipt_id` IS NULL',
      );
      const nullReceiptCount = Number(this.readFirstValue(result, 'count') ?? 0);
      if (nullReceiptCount > 0) {
        throw new Error(
          'Cannot make transactions.receipt_id required while NULL receipt identifiers exist.',
        );
      }

      await queryRunner.changeColumn(
        'transactions',
        'receipt_id',
        new TableColumn({
          name: 'receipt_id',
          type: 'int',
          unsigned: true,
          isNullable: false,
        }),
      );
    }

    if (createdByThisMigration.accounts) {
      await queryRunner.dropTable('accounts', true, true, true);
    }
    if (createdByThisMigration.categories) {
      await queryRunner.dropTable('categories', true, true, true);
    }
  }

  private assertCategoriesCompatible(table: Table): void {
    this.assertColumns('categories', table, [
      { name: 'category_id', type: 'int', nullable: false },
      { name: 'category_name', type: 'varchar', nullable: false },
    ]);
    this.assertUniqueColumns('categories', table, ['category_name']);
  }

  private assertAccountsCompatible(table: Table): void {
    this.assertColumns('accounts', table, [
      { name: 'account_id', type: 'int', nullable: false },
      { name: 'user_id', type: 'int', unsigned: true, nullable: false },
      { name: 'bank_name', type: 'varchar', nullable: false },
      { name: 'account_type', type: 'enum', nullable: false },
      { name: 'branch_name', type: 'varchar', nullable: true },
      { name: 'account_number_full', type: 'varchar', nullable: false },
      { name: 'account_number_last_4', type: 'varchar', nullable: false },
      { name: 'balance', type: 'decimal', nullable: false },
    ]);
    this.assertForeignKey('accounts', table, ['user_id'], 'users', ['id']);
    this.assertUniqueColumns('accounts', table, [
      'user_id',
      'account_number_full',
    ]);
  }

  private assertTransactionsCompatible(table: Table): void {
    this.assertColumns('transactions', table, [
      { name: 'transaction_id', type: 'int', nullable: false },
      { name: 'account_id', type: 'int', nullable: false },
      { name: 'transaction_date', type: 'date', nullable: false },
      { name: 'type', type: 'enum', nullable: false },
      { name: 'item_description', type: 'varchar', nullable: false },
      { name: 'shop_name', type: 'varchar', nullable: true },
      { name: 'amount', type: 'decimal', nullable: false },
      { name: 'payment_method', type: 'varchar', nullable: true },
      { name: 'status', type: 'enum', nullable: false },
      { name: 'receipt_id', type: 'int', unsigned: true, nullable: false },
      { name: 'category_id', type: 'int', nullable: true },
    ], ['receipt_id']);
    this.assertForeignKey(
      'transactions',
      table,
      ['account_id'],
      'accounts',
      ['account_id'],
    );
    this.assertForeignKey(
      'transactions',
      table,
      ['category_id'],
      'categories',
      ['category_id'],
    );
  }

  private assertColumns(
    tableName: string,
    table: Table,
    expectedColumns: readonly ExpectedColumn[],
    nullableMayDiffer: readonly string[] = [],
  ): void {
    for (const expected of expectedColumns) {
      const actual = table.findColumnByName(expected.name);
      const nullableMatches = nullableMayDiffer.includes(expected.name)
        || actual?.isNullable === expected.nullable;
      const unsignedMatches = expected.unsigned === undefined
        || actual?.unsigned === expected.unsigned;
      if (
        !actual
        || actual.type !== expected.type
        || !nullableMatches
        || !unsignedMatches
      ) {
        throw new Error(
          `Existing ${tableName}.${expected.name} is incompatible with the approved UC-13 schema baseline.`,
        );
      }
    }
  }

  private assertForeignKey(
    tableName: string,
    table: Table,
    columnNames: readonly string[],
    referencedTableName: string,
    referencedColumnNames: readonly string[],
  ): void {
    const found = table.foreignKeys.some(
      (foreignKey) =>
        this.sameColumns(foreignKey.columnNames, columnNames)
        && foreignKey.referencedTableName.toLowerCase()
          === referencedTableName.toLowerCase()
        && this.sameColumns(
          foreignKey.referencedColumnNames,
          referencedColumnNames,
        ),
    );
    if (!found) {
      throw new Error(
        `Existing ${tableName} is missing its approved ${columnNames.join(',')} foreign key.`,
      );
    }
  }

  private assertUniqueColumns(
    tableName: string,
    table: Table,
    columnNames: readonly string[],
  ): void {
    const found = table.indices.some(
      (index) => index.isUnique && this.sameColumns(index.columnNames, columnNames),
    ) || table.uniques.some(
      (unique) => this.sameColumns(unique.columnNames, columnNames),
    ) || (
      columnNames.length === 1
      && table.findColumnByName(columnNames[0])?.isUnique === true
    );
    if (!found) {
      throw new Error(
        `Existing ${tableName} is missing approved uniqueness for ${columnNames.join(',')}.`,
      );
    }
  }

  private sameColumns(
    actual: readonly string[],
    expected: readonly string[],
  ): boolean {
    return actual.length === expected.length
      && actual.every((column, index) => column === expected[index]);
  }

  private async hasMigrationComment(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    if (!(await queryRunner.hasTable(tableName))) return false;
    const result: unknown = await queryRunner.query(
      'SELECT TABLE_COMMENT AS tableComment FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      [tableName],
    );
    return this.readFirstValue(result, 'tableComment') === TABLE_COMMENT;
  }

  private async tableHasRows(
    queryRunner: QueryRunner,
    tableName: 'transactions' | 'accounts' | 'categories',
  ): Promise<boolean> {
    const result: unknown = await queryRunner.query(
      `SELECT EXISTS(SELECT 1 FROM \`${tableName}\` LIMIT 1) AS hasRows`,
    );
    return Number(this.readFirstValue(result, 'hasRows') ?? 0) > 0;
  }

  private readFirstValue(result: unknown, key: string): unknown {
    const firstRow: unknown = Array.isArray(result) ? result[0] : undefined;
    return typeof firstRow === 'object'
      && firstRow !== null
      && key in firstRow
      ? (firstRow as Record<string, unknown>)[key]
      : undefined;
  }
}
