import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { LoginUser } from '@/auth/dto/login-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */
export const loginUserFactory = FactoryBuilder.of(LoginUser)
  .props({
    password: faker.internet.password,
    username: () => faker.internet.userName().toLowerCase(),
  })
  .build();
/* eslint-enable */
