import { faker } from '@faker-js/faker';
import { LoginUser } from '~auth/dto/login-user.dto';
import { FactoryBuilder } from 'factory.io';

export const loginUserFactory = FactoryBuilder.of(LoginUser)
  .props({
    password: () => faker.internet.password(),
    username: () => faker.internet.userName().toLowerCase(),
  })
  .build();
