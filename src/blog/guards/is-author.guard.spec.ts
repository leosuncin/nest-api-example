import { ForbiddenException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import { createMocks } from 'node-mocks-http';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';
import { IsAuthorGuard } from '@/blog/guards/is-author.guard';
import { ArticleService } from '@/blog/services/article.service';

const user = User.fromPartial({ id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5' });
const article: Article = Object.create(Article.prototype, {
  id: { value: 'a832e632-0335-4191-8469-4d849bbb72be' },
  slug: {
    value:
      'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
  },
  author: { value: user },
});

describe('IsAuthorGuard', () => {
  const mockArticleService = mock<ArticleService>();
  let guard: IsAuthorGuard;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
        IsAuthorGuard,
      ],
    }).compile();

    guard = module.get<IsAuthorGuard>(IsAuthorGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it.each([article.id, article.slug, 'mLDYhAjz213rjfHRJwqUES'])(
    'should authorize when the current user is the author of %s',
    async (id) => {
      const { req, res } = createMocks<Request, Response>({
        params: { id },
        user,
      });
      const context = new ExecutionContextHost([req, res]);

      mockArticleService.getById
        .calledWith(article.id)
        .mockResolvedValueOnce(article);

      await expect(guard.canActivate(context)).resolves.toBe(true);
    },
  );

  it('should authorize when the article not exist', async () => {
    const { req, res } = createMocks<Request, Response>({
      params: { id: '013cd55e-aed5-4201-a2cd-1458b0c9523b' },
      user,
    });
    const context = new ExecutionContextHost([req, res]);

    mockArticleService.getById.mockResolvedValueOnce(void 0);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw when the current user is not the author', async () => {
    const { req, res } = createMocks<Request, Response>({
      user: User.fromPartial({ id: '63770485-6ee9-4a59-b374-3f194091e2e1' }),
      params: { id: article.id },
    });
    const context = new ExecutionContextHost([req, res]);

    mockArticleService.getById.mockResolvedValueOnce(article);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
