import { setSeederFactory } from 'typeorm-extension';

import { Brand } from '~shop/entities/brand.entity';

export const brandFactory = setSeederFactory(Brand, (faker) =>
  Brand.fromPartial({
    name: faker.company.name(),
    createdAt: faker.date.past(),
    updatedAt: new Date(),
  }),
);
