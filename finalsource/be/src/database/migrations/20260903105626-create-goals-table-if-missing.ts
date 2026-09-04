import { MigrationInterface, QueryRunner, Table } from 'typeorm';

const MIGRATION_TABLE_COMMENT =
  'Created by CreateGoalsTableIfMissing20260903105626';

export class CreateGoalsTableIfMissing20260903105626
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Goals')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'Goals',
        comment: MIGRATION_TABLE_COMMENT,
        columns: [
          {
            name: 'goal_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int', unsigned: true },
          {
            name: 'goal_type',
            type: 'enum',
            enum: ['Saving', 'Expense_Limit'],
          },
          {
            name: 'category_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          {
            name: 'target_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_goals_user',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
          {
            name: 'FK_goals_category',
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['category_id'],
          },
        ],
        indices: [
          {
            name: 'IDX_goals_user_end',
            columnNames: ['user_id', 'end_date'],
          },
          {
            name: 'IDX_goals_user_type_category_dates',
            columnNames: [
              'user_id',
              'goal_type',
              'category_id',
              'start_date',
              'end_date',
            ],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Goals'))) {
      return;
    }

    const commentResult: unknown = await queryRunner.query(
      'SELECT TABLE_COMMENT AS tableComment FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      ['Goals'],
    );
    const tableComment = this.readFirstValue(commentResult, 'tableComment');
    if (tableComment !== MIGRATION_TABLE_COMMENT) {
      throw new Error(
        'Refusing to drop Goals because this migration did not create it.',
      );
    }

    const countResult: unknown = await queryRunner.query(
      'SELECT COUNT(*) AS rowCount FROM `Goals`',
    );
    const rowCount = Number(this.readFirstValue(countResult, 'rowCount') ?? 0);
    if (rowCount > 0) {
      throw new Error('Refusing to drop Goals while persisted rows exist.');
    }

    await queryRunner.dropTable('Goals', true, true, true);
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
