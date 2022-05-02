import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { ok } from 'node:assert/strict';
import { Observable } from 'rxjs';

@Injectable()
export class SetAuthorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<unknown, unknown, Record<string, unknown> | undefined>
      >();

    ok(request.body !== null && typeof request.body === 'object');
    ok(request.user);
    Object.assign(request.body, { author: request.user });

    return next.handle();
  }
}
