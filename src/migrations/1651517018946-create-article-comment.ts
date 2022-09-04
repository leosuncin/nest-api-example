import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleComment1651517018946 implements MigrationInterface {
  name = 'CreateArticleComment1651517018946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "article" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "title" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "content" character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "authorId" uuid NOT NULL,
  CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug"),
  CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id")
)`);
    await queryRunner.query(`ALTER TABLE
  "article"
ADD
  CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE`);

    await queryRunner.query(`CREATE TABLE "comment" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "body" character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "articleId" uuid NOT NULL,
  "authorId" uuid NOT NULL,
  CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
)`);
    await queryRunner.query(`ALTER TABLE
  "comment"
ADD
  CONSTRAINT "FK_c20404221e5c125a581a0d90c0e"
  FOREIGN KEY ("articleId")
  REFERENCES "article"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE
  "comment"
ADD
  CONSTRAINT "FK_276779da446413a0d79598d4fbd"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c20404221e5c125a581a0d90c0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "article"`);
  }
}
