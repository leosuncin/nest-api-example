import { plainToInstance } from 'class-transformer';

import { LoginUser } from '@/auth/dto/login-user.dto';
import { RegisterUser } from '@/auth/dto/register-user.dto';
import { User } from '@/auth/entities/user.entity';
import { fixture } from '@/common/test-helpers';

export const loginFixture = fixture<LoginUser, Partial<LoginUser>>({
  create({ faker }, override) {
    return plainToInstance(LoginUser, {
      password: faker.internet.password(),
      username: faker.internet.userName().toLowerCase(),
      ...override,
    });
  },
});

export const registerFixture = fixture<RegisterUser, Partial<RegisterUser>>({
  create({ faker }, override) {
    return plainToInstance(RegisterUser, {
      email: faker.internet.exampleEmail().toLowerCase(),
      password: faker.internet.password(),
      username: faker.internet.userName().toLowerCase(),
      ...override,
    });
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
