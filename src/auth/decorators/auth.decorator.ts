import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type User } from '~auth/entities/user.entity';
import { type Request } from 'express';

declare module 'express' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-shadow
  interface Request {
    user: User | undefined;
  }
}

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    return context.switchToHttp().getRequest<Request>().user;
  },
);
