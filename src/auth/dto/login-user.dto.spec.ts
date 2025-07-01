import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { LoginUser } from '~auth/dto/login-user.dto';
import { loginUserFactory } from '~auth/factories/login-user.factory';
import { login } from '~auth/fixtures/credentials';
import { AuthenticationService } from '~auth/services/authentication.service';
import { ValidateCredentialConstraint } from '~auth/validators/validate-credential.validator';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMockInstance } from 'jest-create-mock-instance';

describe('Login user validations', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ValidateCredentialConstraint],
    })
      .useMocker((token) => {
        if (token === AuthenticationService) {
          const mock = createMockInstance(AuthenticationService);
          mock.verifyCredentials.mockResolvedValue(true);

          return mock;
        }

        return undefined;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.noShrink(fc.noBias(fc.integer())).map((seed) => {
          faker.seed(seed);

          return loginUserFactory.buildOne();
        }),
        async (data) => {
          const errors = await validate(data);

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
              username: fc.constant(login.username),
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
              password: fc.constant(login.password),
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
