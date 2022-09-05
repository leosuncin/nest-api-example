import type { CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';
import { createMock } from 'ts-auto-mock';

import { type AuthConfig, auth } from '~auth/config/auth';
import { TOKEN_COOKIE_NAME } from '~auth/constants';
import type { User } from '~auth/entities/user.entity';
import { john as user } from '~auth/fixtures/users';
import { TokenInterceptor } from '~auth/interceptors/token.interceptor';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TokenInterceptor],
    })
      .useMocker((token) => {
        if (token === JwtService) {
          return createMock<JwtService>();
        }

        if (token === ConfigService) {
          return createMock<ConfigService>({
            getOrThrow(propertyPath: keyof AuthConfig) {
              // eslint-disable-next-line security/detect-object-injection
              return auth()[propertyPath];
            },
          });
        }

        return;
      })
      .compile();

    interceptor = module.get(TokenInterceptor);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should inject the token into the user', async () => {
    const { req, res } = createMocks();
    const testContext = new ExecutionContextHost([req, res]);
    const nextSpy: CallHandler<User> = {
      handle: () => of(user),
    };

    jwtService.sign.mockReturnValueOnce('j.w.t');

    await expect(
      lastValueFrom(interceptor.intercept(testContext, nextSpy)),
    ).resolves.toEqual(user);
    expect(res.cookies).toHaveProperty(TOKEN_COOKIE_NAME);
  });
});
