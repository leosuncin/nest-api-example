import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Category } from '~shop/entities/category.entity';
import { categories } from '~shop/fixtures/categories';

export class CategorySeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);

    await categoryRepository.save(categories);
    await factoryManager.get(Category).saveMany(3);
  }
}
