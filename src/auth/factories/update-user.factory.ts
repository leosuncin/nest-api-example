import { faker } from '@faker-js/faker';
import { UpdateUser } from '~auth/dto/update-user.dto';
import { FactoryBuilder } from 'factory.io';

export const updateUserFactory = FactoryBuilder.of(UpdateUser)
  .props({
    bio: faker.hacker.phrase,
    email: () => faker.internet.email().toLowerCase(),
    image: faker.image.avatarGitHub,
    newPassword: () => faker.internet.password({ length: 12, memorable: true }),
    password: () => faker.internet.password(),
    username: () => faker.internet.username().toLowerCase().substring(0, 30),
  })
  .build();
