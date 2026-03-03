import { setSeederFactory } from 'typeorm-extension';
import { Article } from '~blog/entities/article.entity';

export const articleFactory = setSeederFactory(Article, (faker) =>
  Article.fromPartial({
    content: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    title: faker.company.catchPhrase(),
  }),
);
