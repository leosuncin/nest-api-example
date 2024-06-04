import { faker } from '@faker-js/faker';
import { CreateArticle } from '~blog/dto/create-article.dto';
import { FactoryBuilder } from 'factory.io';

export const createArticleFactory = FactoryBuilder.of(CreateArticle)
  .props({
    content: faker.lorem.paragraph,
    title: faker.lorem.sentence,
  })
  .build();
