import { type DataSource, In } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';

export class CommentSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // eslint-disable-next-line unicorn/no-array-method-this-argument
    const [jane, john] = await dataSource.manager.find(User, {
      where: { username: In(['jane-doe', 'john-doe']) },
      order: { username: 'ASC' },
    });
    // eslint-disable-next-line unicorn/no-array-method-this-argument
    const [article1, article2] = await dataSource.manager.find(Article, {
      where: {
        id: In([
          'a832e632-0335-4191-8469-4d849bbb72be',
          '31a10506-c334-4841-97a6-144a55bf4ebb',
        ]),
      },
      order: { id: 'DESC' },
    });
    const commentFactory = factoryManager.get(Comment);

    await Promise.allSettled([
      commentFactory.save({
        id: '9395e782-367b-4487-a048-242e37169109',
        article: article1!,
        author: jane!,
      }),
      commentFactory.saveMany(14, {
        article: article1!,
        author: jane!,
      }),
      commentFactory.save({
        id: '2cce7079-b434-42fb-85e3-8d1aadd7bb8a',
        article: article2!,
        author: john!,
      }),
      commentFactory.saveMany(14, {
        article: article2!,
        author: john!,
      }),
    ]);
  }
}
