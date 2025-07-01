import { faker } from '@faker-js/faker';
import { CreateArticle } from '~blog/dto/create-article.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import fc from 'fast-check';

describe('CreateArticle', () => {
  it('should fail with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              content: fc.oneof(fc.nat(), fc.constant(''), fc.constant(null)),
              title: fc.oneof(fc.nat(), fc.constant(''), fc.constant(null)),
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
        fc.noShrink(fc.noBias(fc.integer())).map((seed) => {
          faker.seed(seed);

          return plainToInstance(CreateArticle, {
            content: faker.lorem.paragraph(),
            title: faker.company.catchPhrase(),
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
