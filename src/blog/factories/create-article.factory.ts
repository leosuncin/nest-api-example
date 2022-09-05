import { FactoryBuilder } from 'factory.io';
import { paragraph, sentence } from 'txtgen';

import { CreateArticle } from '~blog/dto/create-article.dto';

export const createArticleFactory = FactoryBuilder.of(CreateArticle)
  .props({
    content: paragraph,
    title: sentence,
  })
  .build();
