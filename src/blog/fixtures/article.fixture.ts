import { plainToInstance } from 'class-transformer';
import { fluse } from 'fluse';

import { CreateArticle } from '@/blog/dto/create-article.dto';
import { UpdateArticle } from '@/blog/dto/update-article.dto';
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
  Partial<Pick<CreateArticle, 'content' | 'title'> & { author: string }>
>({
  create({ txtgen }, override) {
    return plainToInstance(CreateArticle, {
      content: txtgen.paragraph(),
      title: txtgen.sentence(),
      ...override,
    });
  },
});

export const updateArticleFixture = fixture<
  UpdateArticle,
  Partial<UpdateArticle>
>({
  create({ faker, txtgen }, override) {
    return plainToInstance(CreateArticle, {
      ...(faker.datatype.boolean()
        ? { content: txtgen.paragraph() }
        : { title: txtgen.sentence() }),
      ...override,
    });
  },
});
