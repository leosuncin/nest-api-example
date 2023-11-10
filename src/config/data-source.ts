import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import invariant from 'tiny-invariant';
import { DataSource, type DataSourceOptions } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';

import { User } from '~auth/entities/user.entity';
import { userFactory } from '~auth/factories/user.factory';
import { UserSeeder } from '~auth/seeders/user.seeder';
import { Article } from '~blog/entities/article.entity';
import { Comment } from '~blog/entities/comment.entity';
import { articleFactory } from '~blog/factories/article.factory';
import { commentFactory } from '~blog/factories/comment.factory';
import { ArticleSeeder } from '~blog/seeders/article.seeder';
import { CommentSeeder } from '~blog/seeders/comment.seeder';
import { CreateUser1637703183543 } from '~migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '~migrations/1651517018946-create-article-comment';

// needed by TypeORM CLI
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly DATABASE_URL: string;
    }
  }
}

const type: DataSourceOptions['type'] = 'postgres';
const entities: DataSourceOptions['entities'] = [User, Article, Comment];
const migrations: DataSourceOptions['migrations'] = [
  CreateUser1637703183543,
  CreateArticleComment1651517018946,
];
const factories: SeederOptions['factories'] = [
  userFactory,
  articleFactory,
  commentFactory,
];
const seeds: SeederOptions['seeds'] = [
  UserSeeder,
  ArticleSeeder,
  CommentSeeder,
];

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type,
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities,
  migrations,
  factories,
  seeds,
};

export const dataSource = registerAs('data-source', () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      type,
      entities,
      migrations,
      factories,
      seeds,
      migrationsRun: true,
    } as DataSourceOptions & SeederOptions;
  }

  invariant(process.env.DATABASE_URL, 'DATABASE_URL is missing');

  return {
    type,
    url: process.env.DATABASE_URL,
    synchronize: false,
    autoLoadEntities: true,
  } as TypeOrmModuleOptions;
});

export default new DataSource(dataSourceOptions);
