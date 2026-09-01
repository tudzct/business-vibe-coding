import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeTransactionsReceiptIdNullable20260901101931
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
    const result: unknown = await queryRunner.query(
      'SELECT COUNT(*) AS count FROM `transactions` WHERE `receipt_id` IS NULL',
    );
    const firstRow: unknown = Array.isArray(result) ? result[0] : undefined;
    const count =
      typeof firstRow === 'object' && firstRow !== null && 'count' in firstRow
        ? Number(firstRow.count)
        : 0;
    if (count > 0) {
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
}
