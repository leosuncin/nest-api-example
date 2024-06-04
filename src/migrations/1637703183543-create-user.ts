import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateUser1637703183543 implements MigrationInterface {
  name = 'CreateUser1637703183543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" citext NOT NULL,
        "username" citext NOT NULL,
        "password" character varying NOT NULL,
        "image" character varying DEFAULT '',
        "bio" character varying DEFAULT '',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
