import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopSchema1699649023065 implements MigrationInterface {
  name = 'CreateShopSchema1699649023065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE SCHEMA "shop"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP SCHEMA "shop"`);
  }
}
