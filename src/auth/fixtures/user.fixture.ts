import { fluse } from 'fluse';
import typeormPlugin from 'fluse-plugin-typeorm';
import normalizeEmail from 'normalize-email';

import { User } from '@/auth/entities/user.entity';
import { fakerPlugin } from '@/common/fluse-plugin-faker';
import { credentials } from '@/common/test-helpers';

const { fixture } = fluse({
  plugins: {
    faker: fakerPlugin(),
    orm: typeormPlugin(),
  },
});

export const userFixture = fixture<User, Partial<User>>({
  create({ faker, orm }, override) {
    const user = User.fromPartial({
      bio: faker.hacker.phrase(),
      email: normalizeEmail(faker.internet.email()),
      image: faker.internet.avatar(),
      password: credentials.password,
      username: faker.internet.userName().toLowerCase(),
      ...override,
    });

    return orm.entityManager.save(user);
  },
});
