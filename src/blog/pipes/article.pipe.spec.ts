import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';

import { Article } from '@/blog/entities/article.entity';
import { ArticlePipe } from '@/blog/pipes/article.pipe';
import { ArticleService } from '@/blog/services/article.service';

describe('ArticlePipe', () => {
  let pipe: ArticlePipe;
  const mockArticleService = mock<ArticleService>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArticlePipe,
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    pipe = module.get<ArticlePipe>(ArticlePipe);
  });

  afterEach(() => {
    mockReset(mockArticleService);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it.each([
    'abdb39f4-5659-44d2-842b-7fde9d82c6a4',
    'ndRj4RdAAm5VwgGABrGtP3',
    'tempor-in-adipisicing-qui-consectetur-labore-ndRj4RdAAm5VwgGABrGtP3',
  ])('should transform the string "%s" to article', async (value) => {
    mockArticleService.getById
      .calledWith('abdb39f4-5659-44d2-842b-7fde9d82c6a4')
      .mockResolvedValueOnce(new Article());

    await expect(pipe.transform(value)).resolves.toBeInstanceOf(Article);
  });

  it('should throw if the article not exist', async () => {
    mockArticleService.getById.mockResolvedValue(void 0);

    await expect(
      pipe.transform(
        'voluptate-ullamco-est-laborum-eiusmod-consectetur-laborum-exercitation-sit-minim-in-et',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
