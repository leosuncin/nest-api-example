import { type CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { auth, type AuthConfig } from '~auth/config/auth';
import { TOKEN_COOKIE_NAME } from '~auth/constants';
import { type User } from '~auth/entities/user.entity';
import { john as user } from '~auth/fixtures/users';
import { TokenInterceptor } from '~auth/interceptors/token.interceptor';
import { createMockInstance } from 'jest-create-mock-instance';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TokenInterceptor],
    })
      .useMocker((token) => {
        let mock;

        if (token === JwtService) {
          mock = createMockInstance(JwtService);
        }

        if (token === ConfigService) {
          mock = createMockInstance(ConfigService);
          mock.getOrThrow.mockImplementation(
            (propertyPath: keyof AuthConfig) =>
              // eslint-disable-next-line security/detect-object-injection
              auth()[propertyPath],
          );
        }

        return mock;
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
