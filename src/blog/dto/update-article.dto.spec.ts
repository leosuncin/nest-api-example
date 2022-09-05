import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import fc from 'fast-check';

import { UpdateArticle } from '~blog/dto/update-article.dto';

describe('UpdateArticle', () => {
  it('should fail with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              title: fc.oneof(fc.nat(), fc.constant('')),
              content: fc.oneof(fc.nat(), fc.constant('')),
            },
            { withDeletedKeys: true },
          )
          .map((record) => plainToInstance(UpdateArticle, record)),
        async (data) => {
          fc.pre(Object.keys(data).length > 0);

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
          .record(
            {
              title: fc.unicodeString({ minLength: 1 }),
              content: fc.fullUnicodeString({ minLength: 1 }),
            },
            { withDeletedKeys: true },
          )
          .map((record) => plainToInstance(UpdateArticle, record)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });
});
