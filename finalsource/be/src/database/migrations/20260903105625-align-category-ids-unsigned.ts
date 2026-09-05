import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlignCategoryIdsUnsigned20260903105625
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { categoryId, transactionCategoryId, foreignKey } =
      await this.inspectSchema(queryRunner);

    if (categoryId.unsigned && transactionCategoryId.unsigned) return;
    if (categoryId.unsigned || transactionCategoryId.unsigned) {
      throw new Error(
        'Refusing partial category signedness repair: category identifiers must change together.',
      );
    }

    await this.assertNoNegativeCategoryIds(queryRunner);
    await queryRunner.dropForeignKey('transactions', foreignKey);
    await queryRunner.changeColumn(
      'categories',
      'category_id',
      new TableColumn({
        name: 'category_id',
        type: 'int',
        unsigned: true,
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      }),
    );
    await queryRunner.changeColumn(
      'transactions',
      'category_id',
      new TableColumn({
        name: 'category_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'transactions',
      this.copyForeignKey(foreignKey),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { categoryId, transactionCategoryId, foreignKey } =
      await this.inspectSchema(queryRunner);

    if (!categoryId.unsigned && !transactionCategoryId.unsigned) return;
    if (!categoryId.unsigned || !transactionCategoryId.unsigned) {
      throw new Error(
        'Refusing partial category signedness rollback: category identifiers must change together.',
      );
    }

    await queryRunner.dropForeignKey('transactions', foreignKey);
    await queryRunner.changeColumn(
      'transactions',
      'category_id',
      new TableColumn({
        name: 'category_id',
        type: 'int',
        isNullable: true,
      }),
    );
    await queryRunner.changeColumn(
      'categories',
      'category_id',
      new TableColumn({
        name: 'category_id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      }),
    );
    await queryRunner.createForeignKey(
      'transactions',
      this.copyForeignKey(foreignKey),
    );
  }

  private async inspectSchema(queryRunner: QueryRunner) {
    const categories = await queryRunner.getTable('categories');
    const transactions = await queryRunner.getTable('transactions');
    if (!categories || !transactions) {
      throw new Error(
        'Cannot align category identifiers before categories and transactions exist.',
      );
    }

    const categoryId = categories.findColumnByName('category_id');
    const transactionCategoryId =
      transactions.findColumnByName('category_id');
    if (
      !categoryId
      || categoryId.type !== 'int'
      || !categoryId.isPrimary
      || !transactionCategoryId
      || transactionCategoryId.type !== 'int'
      || !transactionCategoryId.isNullable
    ) {
      throw new Error(
        'Existing category identifier columns are incompatible with the approved amendment.',
      );
    }

    const foreignKey = transactions.foreignKeys.find(
      (candidate) =>
        candidate.columnNames.length === 1
        && candidate.columnNames[0] === 'category_id'
        && candidate.referencedTableName.toLowerCase() === 'categories'
        && candidate.referencedColumnNames.length === 1
        && candidate.referencedColumnNames[0] === 'category_id',
    );
    if (!foreignKey) {
      throw new Error(
        'Existing transactions.category_id foreign key is missing or incompatible.',
      );
    }

    return { categoryId, transactionCategoryId, foreignKey };
  }

  private async assertNoNegativeCategoryIds(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const result: unknown = await queryRunner.query(`
      SELECT
        (SELECT COUNT(*) FROM categories WHERE category_id < 0)
        + (SELECT COUNT(*) FROM transactions WHERE category_id < 0)
        AS negativeCount
    `);
    const firstRow: unknown = Array.isArray(result) ? result[0] : undefined;
    const count = typeof firstRow === 'object'
      && firstRow !== null
      && 'negativeCount' in firstRow
      ? Number(firstRow.negativeCount)
      : 0;
    if (count > 0) {
      throw new Error(
        'Cannot convert category identifiers to unsigned while negative values exist.',
      );
    }
  }

  private copyForeignKey(foreignKey: TableForeignKey): TableForeignKey {
    return new TableForeignKey({
      name: foreignKey.name,
      columnNames: foreignKey.columnNames,
      referencedTableName: foreignKey.referencedTableName,
      referencedColumnNames: foreignKey.referencedColumnNames,
      onDelete: foreignKey.onDelete,
      onUpdate: foreignKey.onUpdate,
    });
  }
}
