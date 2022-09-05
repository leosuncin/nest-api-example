import * as txtgen from 'txtgen';
import { setSeederFactory } from 'typeorm-extension';

import { Comment } from '~blog/entities/comment.entity';

export const commentFactory = setSeederFactory(Comment, (faker) =>
  Comment.fromPartial({
    body: txtgen.sentence(),
    createdAt: faker.date.past(),
  }),
);
