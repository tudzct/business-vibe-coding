import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeUsersUsernameNullable20260831095333
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'username',
      new TableColumn({
        name: 'username',
        type: 'varchar',
        length: '255',
        isNullable: true,
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows: unknown = await queryRunner.query(
      'SELECT COUNT(*) AS count FROM `users` WHERE `username` IS NULL',
    );
    const firstRow: unknown = Array.isArray(rows) ? rows[0] : undefined;
    const count =
      typeof firstRow === 'object' && firstRow !== null && 'count' in firstRow
        ? firstRow.count
        : 0;
    if (Number(count) > 0) {
      throw new Error(
        'Cannot make users.username required while NULL usernames exist.',
      );
    }

    await queryRunner.changeColumn(
      'users',
      'username',
      new TableColumn({
        name: 'username',
        type: 'varchar',
        length: '255',
        isNullable: false,
        isUnique: true,
      }),
    );
  }
}
