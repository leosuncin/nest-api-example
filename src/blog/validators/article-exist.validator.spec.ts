import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { ArticleService } from '~blog/services/article.service';
import {
  ArticleExist,
  ArticleExistConstraint,
} from '~blog/validators/article-exist.validator';
import { useContainer, validate } from 'class-validator';
import { createMockInstance } from 'jest-create-mock-instance';

class DTO {
  @ArticleExist()
  readonly articleId: string;

  constructor(articleId: string) {
    this.articleId = articleId;
  }
}

describe('ArticleExist', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArticleExistConstraint],
    })
      .useMocker((token) => {
        let mock;

        if (token === ArticleService) {
          mock = createMockInstance(ArticleService);
          mock.checkExist.mockImplementationOnce((articleId) =>
            Promise.resolve(
              articleId === 'a832e632-0335-4191-8469-4d849bbb72be',
            ),
          );
        }

        return mock;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should pass when the article exist', async () => {
    const dto = new DTO('a832e632-0335-4191-8469-4d849bbb72be');

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when the article not exist', async () => {
    const dto = new DTO(faker.string.uuid());

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });
});
