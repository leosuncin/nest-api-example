import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  type Type,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import type { DataSource } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { userFactory } from '@/auth/factories/user.factory';
import { UserSeeder } from '@/auth/seeders/user.seeder';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { articleFactory } from '@/blog/factories/article.factory';
import { commentFactory } from '@/blog/factories/comment.factory';
import { ArticleSeeder } from '@/blog/seeders/article.seeder';
import { CommentSeeder } from '@/blog/seeders/comment.seeder';
import { database } from '@/common/database';
import { CreateUser1637703183543 } from '@/migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '@/migrations/1651517018946-create-article-comment';

export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          entities: [User, Article, Comment],
          migrations: [
            CreateUser1637703183543,
            CreateArticleComment1651517018946,
          ],
          factories: [userFactory, articleFactory, commentFactory],
          seeds: [UserSeeder, ArticleSeeder, CommentSeeder],
          migrationsRun: true,
          autoLoadEntities: true,
        }),
        dataSourceFactory: (options): Promise<DataSource> =>
          database.adapters.createTypeormDataSource(
            options,
          ) as Promise<DataSource>,
      }),
      ...modules,
    ],
  }).compile();
  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  app.use(cookieParser(process.env['SECRET']));
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}
