import { type DataSourceOptions, DataSource } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';
import { userFactory } from '@/auth/factories/user.factory';
import { UserSeeder } from '@/auth/seeders/user.seeder';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { articleFactory } from '@/blog/factories/article.factory';
import { commentFactory } from '@/blog/factories/comment.factory';
import { ArticleSeeder } from '@/blog/seeders/article.seeder';
import { CommentSeeder } from '@/blog/seeders/comment.seeder';
import { CreateUser1637703183543 } from '@/migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '@/migrations/1651517018946-create-article-comment';

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities: [User, Article, Comment],
  migrations: [CreateUser1637703183543, CreateArticleComment1651517018946],
  factories: [userFactory, articleFactory, commentFactory],
  seeds: [UserSeeder, ArticleSeeder, CommentSeeder],
};

export const dataSource = new DataSource(dataSourceOptions);
