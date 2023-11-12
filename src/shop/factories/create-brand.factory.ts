import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { CreateBrand } from '~shop/dtos/create-brand.dto';

export const createBrandFactory = FactoryBuilder.of(CreateBrand)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  .prop('name', faker.company.name)
  .build();
