import { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import type { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import { lastValueFrom, of } from 'rxjs';

import { CurrentUserInterceptor } from '@/auth/interceptors/current-user.interceptor';

describe('UserInterceptor', () => {
  it('should be defined', () => {
    expect(new CurrentUserInterceptor()).toBeDefined();
  });

  it("should inject the user's id", async () => {
    const request = {
      user: {
        id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
        email: 'john@doe.me',
        username: 'john-doe',
      },
      body: {
        image: 'https://thispersondoesnotexist.com/image',
        username: 'john.doe',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        email: 'johndoe@example.com',
        password: 'ji32k7au4a83',
      },
    } as Request;
    const response = mock<Response>();
    const context = new ExecutionContextHost([request, response]);
    const next = mock<CallHandler>({
      handle: () => of({}),
    });
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(request).toHaveProperty(
      'body.id',
      '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
    );
  });

  it("should not inject the user's id when there is no request's body", async () => {
    const request = {
      user: {
        id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
        email: 'john@doe.me',
        username: 'john-doe',
      },
      body: undefined,
    } as Request;
    const response = mock<Response>();
    const context = new ExecutionContextHost([request, response]);
    const next = mock<CallHandler>({
      handle: () => of({}),
    });
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(request).not.toHaveProperty('body.id');
  });

  it('should not modify when there is no user', async () => {
    const request = {
      user: undefined,
      body: {
        image: 'https://thispersondoesnotexist.com/image',
        username: 'john.doe',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        email: 'johndoe@example.com',
        password: 'ji32k7au4a83',
      },
    } as Request;
    const response = mock<Response>();
    const context = new ExecutionContextHost([request, response]);
    const next = mock<CallHandler>({
      handle: () => of({}),
    });
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(request).not.toHaveProperty('body.id');
  });
});
