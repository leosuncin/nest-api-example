import { Test } from '@nestjs/testing';
import { CreateComment } from '~blog/dto/create-comment';
import { ArticleService } from '~blog/services/article.service';
import { ArticleExistConstraint } from '~blog/validators/article-exist.validator';
import { plainToInstance } from 'class-transformer';
import { isUUID, useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMockInstance } from 'jest-create-mock-instance';

describe('CreateComment DTO', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArticleExistConstraint],
    })
      .useMocker((token) => {
        let mock;

        if (token === ArticleService) {
          mock = createMockInstance(ArticleService);
          mock.checkExist.mockImplementation((articleId: string) =>
            Promise.resolve(isUUID(articleId)),
          );
        }

        return mock;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should pass with valid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record({
            article: fc.uuid({ version: 4 }),
            body: fc.string({ minLength: 1 }),
          })
          .map((data) => plainToInstance(CreateComment, data)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });

  it('should fail with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record({
            article: fc.string(),
            body: fc.oneof(fc.nat(), fc.constant('')),
          })
          .map((data) => plainToInstance(CreateComment, data)),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
        },
      ),
    );
  });
});
