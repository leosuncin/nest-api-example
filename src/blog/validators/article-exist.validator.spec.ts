import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';
import { mock, MockProxy } from 'jest-mock-extended';

import { ArticleService } from '@/blog/services/article.service';
import {
  ArticleExist,
  ArticleExistConstraint,
} from '@/blog/validators/article-exist.validator';

class DTO {
  @ArticleExist()
  readonly articleId: string;

  constructor(articleId: string) {
    this.articleId = articleId;
  }
}

describe('ArticleExist', () => {
  let service: MockProxy<ArticleService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleExistConstraint],
    })
      .useMocker((token) => {
        if (Object.is(token, ArticleService)) {
          return mock<ArticleService>();
        }
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    service = module.get<ArticleService, MockProxy<ArticleService>>(
      ArticleService,
    );
  });

  it('should pass when the article exist', async () => {
    const dto = new DTO('a832e632-0335-4191-8469-4d849bbb72be');

    service.checkExist
      .calledWith('a832e632-0335-4191-8469-4d849bbb72be')
      .mockResolvedValueOnce(true);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when the article not exist', async () => {
    const dto = new DTO(faker.datatype.uuid());

    service.checkExist.mockResolvedValueOnce(false);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });
});
