import { fluse } from 'fluse';
import normalizeEmail from 'normalize-email';

import { User } from '@/auth/entities/user.entity';
import { credentials } from '@/common/fixtures/credentials';
import { fakerPlugin } from '@/common/fluse-plugin-faker';
import { typeORMPlugin } from '@/common/fluse-plugin-typeorm';

const { fixture } = fluse({
  plugins: {
    faker: fakerPlugin(),
    orm: typeORMPlugin(),
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
