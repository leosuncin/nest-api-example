import { faker } from '@faker-js/faker';
import { RegisterUser } from '~auth/dto/register-user.dto';
import { loginUserFactory } from '~auth/factories/login-user.factory';
import { FactoryBuilder } from 'factory.io';

export const registerUserFactory = FactoryBuilder.of(RegisterUser)
  .mixins([loginUserFactory])
  .prop('email', () => faker.internet.exampleEmail().toLowerCase())
  .build();
