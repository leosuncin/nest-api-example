import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';

@Injectable()
export class SetAuthorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<unknown, unknown, Record<string, unknown> | undefined>
      >();

    invariant(request.body !== null && typeof request.body === 'object');
    invariant(request.user);
    Object.assign(request.body, { author: request.user });

    return next.handle();
  }
}
