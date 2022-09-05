import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { UpdateUser } from '~auth/dto/update-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */
export const updateUserFactory = FactoryBuilder.of(UpdateUser)
  .props({
    bio: faker.hacker.phrase,
    email: () => faker.internet.email().toLowerCase(),
    image: faker.internet.avatar,
    newPassword: faker.internet.password.bind(faker, 12, true),
    password: faker.internet.password,
    username: () => faker.internet.userName().toLowerCase(),
  })
  .build();
/* eslint-enable */
