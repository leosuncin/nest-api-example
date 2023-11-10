import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopCategory1699649201467 implements MigrationInterface {
  name = 'CreateShopCategory1699649201467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "shop"."category" (
      "id" character varying(33) NOT NULL,
      "name" character varying NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "deletedAt" TIMESTAMP,
      CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE "shop"."category"`);
  }
}
