import { type CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { articleByJane } from '~blog/fixtures/articles';
import { SetArticleInterceptor } from '~blog/interceptors/set-article.interceptor';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

describe('SetArticleInterceptor', () => {
  it('should be defined', () => {
    expect(new SetArticleInterceptor()).toBeDefined();
  });

  it.each([articleByJane.id, articleByJane.slug, '78rW4UUH2Ekokt36qUGxqP'])(
    'should inject the article %s',
    async (articleId) => {
      const { req, res } = createMocks({
        body: {
          body: 'Excepteur do est minim amet laboris in enim nulla',
        },
        params: { articleId },
        path: `/articles/${articleId}/comments`,
      });
      const context = new ExecutionContextHost([req, res]);
      const next: CallHandler = {
        handle: () => of({}),
      };
      const interceptor = new SetArticleInterceptor();

      await lastValueFrom(interceptor.intercept(context, next));

      expect(req).toHaveProperty('body.article', articleByJane.id);
    },
  );
});
