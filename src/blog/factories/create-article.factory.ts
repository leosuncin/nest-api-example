import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { CreateArticle } from '~blog/dto/create-article.dto';

export const createArticleFactory = FactoryBuilder.of(CreateArticle)
  .props({
    content: faker.lorem.paragraph,
    title: faker.lorem.sentence,
  })
  .build();
