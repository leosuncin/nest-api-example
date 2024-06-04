import { User } from '~auth/entities/user.entity';
import { Article } from '~blog/entities/article.entity';
import { articleByJane, articleByJohn } from '~blog/fixtures/articles';
import { type DataSource } from 'typeorm';
import { type Seeder, type SeederFactoryManager } from 'typeorm-extension';

export class ArticleSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const users = await dataSource.manager.find(User);
    const articleFactory = factoryManager.get(Article);

    await articleFactory.save(articleByJohn);
    await articleFactory.save(articleByJane);

    for (const author of users) {
      await articleFactory.saveMany(10, { author });
    }
  }
}
