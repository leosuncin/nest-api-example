import { setSeederFactory } from 'typeorm-extension';

import { Comment } from '~blog/entities/comment.entity';

export const commentFactory = setSeederFactory(Comment, (faker) =>
  Comment.fromPartial({
    body: faker.lorem.sentence(),
    createdAt: faker.date.past(),
  }),
);
