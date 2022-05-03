import { plainToInstance } from 'class-transformer';
import { fluse } from 'fluse';

import { CreateArticle } from '@/blog/dto/create-article.dto';
import { fakerPlugin } from '@/common/fluse-plugin-faker';
import { txtgenPlugin } from '@/common/fluse-plugin-txtgen';

const { fixture } = fluse({
  plugins: {
    faker: fakerPlugin(),
    txtgen: txtgenPlugin(),
  },
});

export const createArticleFixture = fixture<
  CreateArticle,
  Partial<Pick<CreateArticle, 'content' | 'title'>>
>({
  create({ txtgen }, override) {
    return plainToInstance(CreateArticle, {
      content: txtgen.paragraph(),
      title: txtgen.sentence(),
      ...override,
    });
  },
});
