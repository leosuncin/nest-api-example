import { faker } from '@faker-js/faker';
import { CreateComment } from '~blog/dto/create-comment';
import { FactoryBuilder } from 'factory.io';

export const createCommentFactory = FactoryBuilder.of(CreateComment)
  .prop('body', faker.lorem.paragraph)
  .build();
