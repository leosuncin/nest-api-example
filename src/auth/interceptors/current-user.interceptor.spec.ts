import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { john as user } from '@/auth/fixtures/users';
import { CurrentUserInterceptor } from '@/auth/interceptors/current-user.interceptor';

describe('UserInterceptor', () => {
  it('should be defined', () => {
    expect(new CurrentUserInterceptor()).toBeDefined();
  });

  it("should inject the user's id", async () => {
    const { req, res } = createMocks({
      user,
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
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).toHaveProperty('body.id', user.id);
  });

  it("should not inject the user's id when there is no request's body", async () => {
    const { req, res } = createMocks({
      user,
    });
    delete req.body;
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new CurrentUserInterceptor();

    delete req.body;
    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).not.toHaveProperty('body.id');
  });

  it('should not modify when there is no user', async () => {
    const { req, res } = createMocks({
      user: undefined,
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
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).not.toHaveProperty('body.id');
  });
});
