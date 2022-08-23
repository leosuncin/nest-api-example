import { type DataSourceOptions, DataSource } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { CreateUser1637703183543 } from '@/migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '@/migrations/1651517018946-create-article-comment';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities: [User, Article, Comment],
  migrations: [CreateUser1637703183543, CreateArticleComment1651517018946],
};

export const dataSource = new DataSource(dataSourceOptions);
