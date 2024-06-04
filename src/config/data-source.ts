import { registerAs } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CreateUser1637703183543 } from '~migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '~migrations/1651517018946-create-article-comment';
import invariant from 'tiny-invariant';

export const dataSource = registerAs('data-source', () => {
  invariant(process.env.DATABASE_URL, 'DATABASE_URL is missing');

  return {
    autoLoadEntities: true,
    migrations: [CreateUser1637703183543, CreateArticleComment1651517018946],
    synchronize: false,
    type: 'postgres',
    url: process.env.DATABASE_URL,
  } satisfies TypeOrmModuleOptions;
});
