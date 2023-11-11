import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { CreateCategory } from '~shop/dtos/create-category.dto'

export const createCategoryFactory = FactoryBuilder.of(CreateCategory)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  .prop('name', faker.commerce.productAdjective)
  .build();
