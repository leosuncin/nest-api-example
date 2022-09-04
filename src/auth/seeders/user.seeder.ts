import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '@/auth/entities/user.entity';
import { jane, john } from '@/auth/fixtures/users';

export class UserSeeder implements Seeder {
  async run(
    _: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);

    await userFactory.save(john);
    await userFactory.save(jane);
    await userFactory.saveMany(5);
  }
}
