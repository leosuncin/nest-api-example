import { setSeederFactory } from 'typeorm-extension';

import { Category } from '~shop/entities/category.entity';

export const categoryFactory = setSeederFactory(Category, (faker) =>
  Category.fromPartial({
    name: faker.commerce.department(),
    createdAt: faker.date.past(),
  }),
);
