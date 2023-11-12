import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopBrand1699827319121 implements MigrationInterface {
  name = 'CreateShopBrand1699827319121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "shop"."brand" (
      "id" character varying(33) NOT NULL,
      "name" character varying NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "deletedAt" TIMESTAMP,
      CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE "shop"."brand"`);
  }
}
