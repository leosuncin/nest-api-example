import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Brand } from '~shop/entities/brand.entity';
import { brands } from '~shop/fixtures/brands';

export class BrandSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const brandRepository = dataSource.getRepository(Brand);

    await brandRepository.save(brands as unknown as Brand[]);
    await factoryManager.get(Brand).saveMany(3);
  }
}
