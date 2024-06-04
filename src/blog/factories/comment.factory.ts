import { Comment } from '~blog/entities/comment.entity';
import { setSeederFactory } from 'typeorm-extension';

export const commentFactory = setSeederFactory(Comment, (faker) =>
  Comment.fromPartial({
    body: faker.lorem.sentence(),
    createdAt: faker.date.past(),
  }),
);
