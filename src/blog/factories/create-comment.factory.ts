import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { CreateComment } from '~blog/dto/create-comment';

export const createCommentFactory = FactoryBuilder.of(CreateComment)
  .prop('body', faker.lorem.paragraph) // eslint-disable-line @typescript-eslint/unbound-method
  .build();
