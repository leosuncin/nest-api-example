import { fluse } from 'fluse';
import typeormPlugin from 'fluse-plugin-typeorm';

import { User } from '@/auth/entities/user.entity';
import { fakerPlugin } from '@/common/fluse-plugin-faker';

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
      email: faker.internet.email().toLowerCase(),
      image: faker.internet.avatar(),
      password: 'Th€Pa$$w0rd!',
      username: faker.internet.userName().toLowerCase(),
      ...override,
    });

    return orm.entityManager.save(user);
  },
});
