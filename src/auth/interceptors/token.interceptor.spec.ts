import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { anyObject, mock, MockProxy } from 'jest-mock-extended';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { User } from '@/auth/entities/user.entity';
import { TokenInterceptor } from '@/auth/interceptors/token.interceptor';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let jwtService: MockProxy<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: mock<JwtService>(),
        },
        TokenInterceptor,
      ],
    }).compile();

    interceptor = module.get(TokenInterceptor);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should inject the token into the user', async () => {
    const user = User.fromPartial({
      id: '',
      email: 'jhon@doe.me',
      username: 'john_doe',
      bio: '',
      image: '',
    });
    const { req, res } = createMocks();
    const testContext = new ExecutionContextHost([req, res]);
    const nextSpy: jest.Mocked<CallHandler<User>> = mock({
      handle: () => of(user),
    });

    jwtService.sign.calledWith(anyObject()).mockReturnValue('j.w.t');

    await expect(
      lastValueFrom(interceptor.intercept(testContext, nextSpy)),
    ).resolves.toEqual(user);
    expect(res.cookies).toHaveProperty('token');
  });
});
