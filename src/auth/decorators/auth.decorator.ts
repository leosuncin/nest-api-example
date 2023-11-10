import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { User } from '~auth/entities/user.entity';

declare module 'express' {
  interface Request {
    user: User | undefined;
  }
}

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    return context.switchToHttp().getRequest<Request>().user;
  },
);
