import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { User } from '@/auth/entities/user.entity';
import { SetAuthorInterceptor } from '@/blog/interceptors/set-author.interceptor';

describe('SetAuthorInterceptor', () => {
  it('should be defined', () => {
    expect(new SetAuthorInterceptor()).toBeDefined();
  });

  it("should inject the user's id", async () => {
    const { req, res } = createMocks({
      user: User.fromPartial({
        id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
        email: 'john@doe.me',
        username: 'john-doe',
      }),
      body: {
        image: 'https://thispersondoesnotexist.com/image',
        username: 'john.doe',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        email: 'johndoe@example.com',
        password: 'ji32k7au4a83',
      },
    });
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new SetAuthorInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).toHaveProperty('body.author', req.user);
  });
});
