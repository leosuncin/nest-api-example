import { plainToInstance } from 'class-transformer';
import { fluse } from 'fluse';

import { LoginUser } from '@/auth/dto/login-user.dto';
import { RegisterUser } from '@/auth/dto/register-user.dto';
import { fakerPlugin } from '@/common/fluse-plugin-faker';

const { fixture } = fluse({
  plugins: {
    faker: fakerPlugin(),
  },
});

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
