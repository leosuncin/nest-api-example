import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { john as user } from '~auth/fixtures/users';
import { SetAuthorInterceptor } from '~blog/interceptors/set-author.interceptor';

describe('SetAuthorInterceptor', () => {
  it('should be defined', () => {
    expect(new SetAuthorInterceptor()).toBeDefined();
  });

  it("should inject the user's id", async () => {
    const { req, res } = createMocks({
      user,
      body: {
        title: 'Lorem est pariatur aute veniam non duis.',
        content: `Quis eu officia eiusmod.
Amet ea labore aliquip mollit duis laborum dolore non ad.
Occaecat labore laborum consectetur mollit cupidatat exercitation sunt amet quis ex consequat.
Duis laborum est laborum ut enim dolor duis aliqua cillum.

Nostrud culpa ullamco occaecat.
In ad labore amet id exercitation velit tempor.
Exercitation tempor ea incididunt velit laboris commodo eiusmod consectetur non aute nostrud veniam irure.
Irure fugiat ad ex pariatur ipsum Lorem esse sit labore occaecat.
Fugiat ipsum dolor nostrud deserunt ut minim commodo ut dolore aliqua Lorem commodo exercitation laborum adipisicing.`,
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
