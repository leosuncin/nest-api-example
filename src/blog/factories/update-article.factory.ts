import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';
import { paragraph, sentence } from 'txtgen';

import { UpdateArticle } from '~blog/dto/update-article.dto';

export const updateArticleFactory = FactoryBuilder.of(UpdateArticle)
  .props({
    ...(faker.datatype.boolean()
      ? { content: paragraph }
      : { title: sentence }),
  })
  .build();
