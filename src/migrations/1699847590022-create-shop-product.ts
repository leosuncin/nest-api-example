// cSpell:ignore bebc
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopProduct1699847590022 implements MigrationInterface {
  name = 'CreateShopProduct1699847590022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "shop"."product" (
      "id" character varying(33) NOT NULL,
      "name" character varying NOT NULL,
      "modelYear" integer NOT NULL,
      "listPrice" numeric(10,2) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "deletedAt" TIMESTAMP,
      CONSTRAINT "valid_year" CHECK ("modelYear" >= 1900),
      CONSTRAINT "positive_price" CHECK ("listPrice" >= 0),
      CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `DROP TABLE "shop"."product"`);
  }
}
