import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';

export class UserSeeder implements Seeder {
  async run(
    _: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);

    await userFactory.save({
      id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
      username: 'john-doe',
      email: 'john@doe.me',
    });
    await userFactory.save({
      id: '63770485-6ee9-4a59-b374-3f194091e2e1',
      username: 'jane-doe',
      email: 'jane@doe.me',
    });
    await userFactory.saveMany(5);
  }
}
