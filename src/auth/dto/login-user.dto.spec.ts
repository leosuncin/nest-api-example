import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';

import { LoginUser } from '@/auth/dto/login-user.dto';
import { User } from '@/auth/entities/user.entity';
import { loginFixture } from '@/auth/fixtures/auth.fixture';
import { ValidateCredentialConstraint } from '@/auth/validators/validate-credential.validator';

describe('Login user validations', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ValidateCredentialConstraint],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return createMock<Repository<User>>({
            findOne: jest.fn().mockResolvedValue(
              createMock<User>({
                checkPassword: jest.fn().mockResolvedValue(true),
              }),
            ),
          });
        }
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed) => loginFixture().execute({ faker: { seed } })),
        async (data) => {
          const errors = await validate(await data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });

  it('should require all properties', async () => {
    await expect(validate(new LoginUser())).resolves.toMatchSnapshot();
  });

  it('should find the errors in the password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              password: fc.oneof(
                fc.nat(),
                fc.string({ maxLength: 7 }),
                fc.string({ minLength: 31 }),
              ),
              username: fc.constant('john.doe'),
            },
            { requiredKeys: ['username'] },
          )
          .map((plain) => plainToInstance(LoginUser, plain)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(1);
          expect(errors[0]).toHaveProperty('property', 'password');
        },
      ),
    );
  });

  it('should find the errors in the username', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              password: fc.constant('ThePassword!'),
              username: fc.oneof(
                fc.nat(),
                fc.constant(''),
                fc.string({ minLength: 31 }),
              ),
            },
            { requiredKeys: ['password'] },
          )
          .map((plain) => plainToInstance(LoginUser, plain)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(1);
          expect(errors[0]).toHaveProperty('property', 'username');
        },
      ),
    );
  });
});
