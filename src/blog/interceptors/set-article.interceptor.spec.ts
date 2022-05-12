import { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { SetArticleInterceptor } from '@/blog/interceptors/set-article.interceptor';

describe('SetArticleInterceptor', () => {
  it('should be defined', () => {
    expect(new SetArticleInterceptor()).toBeDefined();
  });

  it.each([
    '31a10506-c334-4841-97a6-144a55bf4ebb',
    'though-we-assume-the-latter-however-blueberries-have-begun-to-rent-currants-over-the-past-few-months-specifically-for-eagles-associated-with-their-lemons-78rW4UUH2Ekokt36qUGxqP',
    '78rW4UUH2Ekokt36qUGxqP',
  ])('should inject the article %s', async (articleId) => {
    const { req, res } = createMocks({
      path: `/articles/${articleId}/comments`,
      params: { articleId },
      body: {
        body: 'Excepteur do est minim amet laboris in enim nulla',
      },
    });
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new SetArticleInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).toHaveProperty(
      'body.article',
      '31a10506-c334-4841-97a6-144a55bf4ebb',
    );
  });
});
