import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';

export class ArticleSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const users = await dataSource.manager.find(User);
    const articleFactory = factoryManager.get(Article);

    await articleFactory.save({
      id: 'a832e632-0335-4191-8469-4d849bbb72be',
      title:
        'However, wolfs have begun to rent blueberries over the past few months, specifically for lions associated with their puppies?',
      slug: 'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
      content: `However, tigers have begun to rent seals over the past few months, specifically for monkeys associated with their squirrels!
However, cats have begun to rent blueberries over the past few months, specifically for sharks associated with their puppies.
Some assert that however, ducks have begun to rent octopus over the past few months, specifically for sharks associated with their snakes.
Though we assume the latter, however, birds have begun to rent kumquats over the past few months, specifically for chickens associated with their watermelons.`,
      author: users.find((user) => user.username === 'john-doe')!,
    });
    await articleFactory.save({
      id: '31a10506-c334-4841-97a6-144a55bf4ebb',
      title:
        'Though we assume the latter, however, blueberries have begun to rent currants over the past few months, specifically for eagles associated with their lemons.',
      slug: 'though-we-assume-the-latter-however-blueberries-have-begun-to-rent-currants-over-the-past-few-months-specifically-for-eagles-associated-with-their-lemons-78rW4UUH2Ekokt36qUGxqP',
      content: `It's very tricky, if not impossible, however, dolphins have begun to rent zebras over the past few months, specifically for oranges associated with their persimmons.
Of course, however, plums have begun to rent raspberries over the past few months, specifically for giraffes associated with their lions.
This is not to discredit the idea that however, alligators have begun to rent sharks over the past few months, specifically for sheeps associated with their monkeys.
However, pomegranates have begun to rent sheeps over the past few months, specifically for apricots associated with their grapes.`,
      author: users.find((user) => user.username === 'jane-doe')!,
    });

    for (const author of users) {
      await articleFactory.saveMany(10, { author });
    }
  }
}
