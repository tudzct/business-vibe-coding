import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeGoalsCategoryNullable20260903105627
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `Goals` MODIFY `category_id` INT UNSIGNED NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const result: unknown = await queryRunner.query(
      'SELECT COUNT(*) AS count FROM `Goals` WHERE `category_id` IS NULL',
    );
    const firstRow: unknown = Array.isArray(result) ? result[0] : undefined;
    const nullCategoryCount =
      typeof firstRow === 'object' && firstRow !== null && 'count' in firstRow
        ? Number((firstRow as Record<string, unknown>).count)
        : 0;
    if (nullCategoryCount > 0) {
      throw new Error(
        'Cannot make Goals.category_id required while NULL category values exist.',
      );
    }

    await queryRunner.query(
      'ALTER TABLE `Goals` MODIFY `category_id` INT UNSIGNED NOT NULL',
    );
  }
}
