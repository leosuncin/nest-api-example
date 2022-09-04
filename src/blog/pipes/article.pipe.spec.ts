import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { Article } from '@/blog/entities/article.entity';
import { articleByJohn } from '@/blog/fixtures/articles';
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
            getById: jest.fn().mockImplementation((id: Article['id']) =>
              Promise.resolve(
                id === articleByJohn.id
                  ? new Article()
                  : // eslint-disable-next-line unicorn/no-null
                    null,
              ),
            ),
          });
        }

        return;
      })
      .compile();

    pipe = module.get(ArticlePipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it.each([articleByJohn.id, articleByJohn.slug, 'mLDYhAjz213rjfHRJwqUES'])(
    'should transform the string "%s" to article',
    async (value) => {
      await expect(pipe.transform(value)).resolves.toBeInstanceOf(Article);
    },
  );

  it('should throw if the article not exist', async () => {
    await expect(
      pipe.transform(
        'voluptate-ullamco-est-laborum-eiusmod-consectetur-laborum-exercitation-sit-minim-in-et',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
