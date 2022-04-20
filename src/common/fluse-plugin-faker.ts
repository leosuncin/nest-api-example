import { type Faker, faker } from '@faker-js/faker';
import { createPlugin } from 'fluse';

type FakerPluginOptions = {
  seed: number;
};

export function fakerPlugin() {
  return createPlugin<Faker, FakerPluginOptions>({
    name: 'faker',
    version: '^1.0.0',
    execute(next, options) {
      if (Number.isFinite(options?.seed)) {
        faker.seed(options.seed);
      }

      return next(faker);
    },
  });
}
