import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import invariant from 'tiny-invariant';

import { Article } from '~blog/entities/article.entity';

@Injectable()
export class SetArticleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<
          { articleId: string },
          unknown,
          Record<string, unknown> | undefined
        >
      >();
    const articleId = Article.extractId(request.params.articleId);

    invariant(request.body !== null && typeof request.body === 'object');

    Object.assign(request.body, { article: articleId });

    return next.handle();
  }
}
