import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import fc from 'fast-check';

import { CreateArticle } from '~blog/dto/create-article.dto';

describe('CreateArticle', () => {
  it('should fail with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              /* eslint-disable unicorn/no-null */
              title: fc.oneof(fc.nat(), fc.constant(''), fc.constant(null)),
              content: fc.oneof(fc.nat(), fc.constant(''), fc.constant(null)),
              /* eslint-enable */
            },
            { withDeletedKeys: true },
          )
          .map((record) => plainToInstance(CreateArticle, record)),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(
            errors.every(({ property }) =>
              ['title', 'content'].includes(property),
            ),
          ).toBe(true);
        },
      ),
    );
  });

  it('should pass with valid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed) => {
            faker.seed(seed);

            return plainToInstance(CreateArticle, {
              title: faker.company.catchPhrase(),
              content: faker.lorem.paragraph(),
            });
          }),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });
});
