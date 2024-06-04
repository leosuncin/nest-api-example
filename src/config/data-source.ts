import { registerAs } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
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
import invariant from 'tiny-invariant';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { type SeederOptions } from 'typeorm-extension';

// needed by TypeORM CLI
declare global {
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      readonly DATABASE_URL: string;
      readonly NODE_ENV: 'development' | 'production' | 'test';
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
  entities,
  factories,
  migrations,
  seeds,
  synchronize: false,
  type,
  url: process.env.DATABASE_URL,
};

export const dataSource = registerAs('data-source', () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      entities,
      factories,
      migrations,
      migrationsRun: true,
      seeds,
      type,
    } as DataSourceOptions & SeederOptions;
  }

  invariant(process.env.DATABASE_URL, 'DATABASE_URL is missing');

  return {
    autoLoadEntities: true,
    synchronize: false,
    type,
    url: process.env.DATABASE_URL,
  } as TypeOrmModuleOptions;
});

export default new DataSource(dataSourceOptions);
