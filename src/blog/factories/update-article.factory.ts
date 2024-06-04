import { faker } from '@faker-js/faker';
import { UpdateArticle } from '~blog/dto/update-article.dto';
import { FactoryBuilder } from 'factory.io';

export const updateArticleFactory = FactoryBuilder.of(UpdateArticle)
  .props({
    ...(faker.datatype.boolean()
      ? { content: faker.lorem.paragraph }
      : { title: faker.lorem.sentence }),
  })
  .build();
