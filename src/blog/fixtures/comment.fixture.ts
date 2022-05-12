import { plainToInstance } from 'class-transformer';
import { fluse } from 'fluse';

import { CreateComment } from '@/blog/dto/create-comment';
import { fakerPlugin } from '@/common/fluse-plugin-faker';

const { fixture } = fluse({
  plugins: {
    faker: fakerPlugin(),
  },
});

export const createCommentFixture = fixture<
  CreateComment,
  Partial<Pick<CreateComment, 'body'>>
>({
  create({ faker }, override) {
    return plainToInstance(CreateComment, {
      body: faker.lorem.paragraph(),
      ...override,
    });
  },
});
