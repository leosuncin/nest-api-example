import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { Article } from '@/blog/entities/article.entity';
import { ArticlePipe } from '@/blog/pipes/article.pipe';
import { ArticleService } from '@/blog/services/article.service';

describe('ArticlePipe', () => {
  let pipe: ArticlePipe;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArticlePipe],
    })
      .useMocker((token) => {
        if (token === ArticleService) {
          return createMock<ArticleService>({
            getById: jest
              .fn()
              .mockImplementation((id: Article['id']) =>
                Promise.resolve(
                  id === 'abdb39f4-5659-44d2-842b-7fde9d82c6a4'
                    ? new Article()
                    : undefined,
                ),
              ),
          });
        }
      })
      .compile();

    pipe = module.get(ArticlePipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it.each([
    'abdb39f4-5659-44d2-842b-7fde9d82c6a4',
    'ndRj4RdAAm5VwgGABrGtP3',
    'tempor-in-adipisicing-qui-consectetur-labore-ndRj4RdAAm5VwgGABrGtP3',
  ])('should transform the string "%s" to article', async (value) => {
    await expect(pipe.transform(value)).resolves.toBeInstanceOf(Article);
  });

  it('should throw if the article not exist', async () => {
    await expect(
      pipe.transform(
        'voluptate-ullamco-est-laborum-eiusmod-consectetur-laborum-exercitation-sit-minim-in-et',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
