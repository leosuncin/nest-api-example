import { setSeederFactory } from 'typeorm-extension';

import { Article } from '~blog/entities/article.entity';

export const articleFactory = setSeederFactory(Article, (faker) =>
  Article.fromPartial({
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
  }),
);
