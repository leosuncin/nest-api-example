import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { RegisterUser } from '~auth/dto/register-user.dto';
import { loginUserFactory } from '~auth/factories/login-user.factory';

/* eslint-disable @typescript-eslint/unbound-method */
export const registerUserFactory = FactoryBuilder.of(RegisterUser)
  .mixins([loginUserFactory])
  .prop('email', () => faker.internet.exampleEmail().toLowerCase())
  .build();
/* eslint-enable */
