import normalizeEmail from 'normalize-email';
import { setSeederFactory } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';
import { login as credentials } from '@/auth/fixtures/credentials';

export const userFactory = setSeederFactory(User, (faker) =>
  User.fromPartial({
    bio: faker.hacker.phrase(),
    email: normalizeEmail(faker.internet.email()),
    image: faker.internet.avatar(),
    password: credentials.password,
    username: faker.internet.userName().toLowerCase(),
  }),
);
