import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';
import { LoginUser } from '~auth/dto/login-user.dto';

export const loginUserFactory = FactoryBuilder.of(LoginUser)
  .props({
    password: () => faker.internet.password(),
    username: () => faker.internet.username().toLowerCase().slice(0, 30),
  })
  .build();
