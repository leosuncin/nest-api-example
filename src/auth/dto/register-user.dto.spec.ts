import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { RegisterUser } from '~auth/dto/register-user.dto';
import { registerUserFactory } from '~auth/factories/register-user.factory';
import { register } from '~auth/fixtures/credentials';
import { PWNED_PASSWORD } from '~auth/providers/pwned-password.provider';
import { AuthenticationService } from '~auth/services/authentication.service';
import { IsAlreadyRegisterConstraint } from '~auth/validators/is-already-register.validator';
import { IsNotVulnerableConstraint } from '~auth/validators/is-not-vulnerable.validator';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMockInstance } from 'jest-create-mock-instance';

describe('Register user validations', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: PWNED_PASSWORD,
          useValue: jest
            .fn()
            .mockImplementation((password: string) =>
              Promise.resolve(password === 'password' ? 9_545_824 : 0),
            ),
        },
        {
          provide: AuthenticationService,
          useFactory() {
            const mock = createMockInstance(AuthenticationService);
            mock.isRegistered.mockResolvedValue(false);

            return mock;
          },
        },
        IsAlreadyRegisterConstraint,
        IsNotVulnerableConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.noShrink(fc.noBias(fc.integer())).map((seed) => {
          faker.seed(seed);

          return registerUserFactory.buildOne();
        }),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });

  it('should require all properties', async () => {
    await expect(validate(new RegisterUser())).resolves.toMatchSnapshot();
  });

  it('should find the errors in the email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              email: fc.oneof(fc.nat(), fc.string()),
              password: fc.constant(register.password),
              username: fc.constant(register.username),
            },
            { requiredKeys: ['password', 'username'] },
          )
          .map((plain) => plainToInstance(RegisterUser, plain)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(1);
          expect(errors[0]).toHaveProperty('property', 'email');
        },
      ),
    );
  });

  it('should find the errors in the password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record(
            {
              email: fc.constant(register.email),
              password: fc.oneof(
                fc.nat(),
                fc.string({ maxLength: 7 }),
                fc.string({ minLength: 31 }),
                fc.constant('password'),
              ),
              username: fc.constant(register.username),
            },
            { requiredKeys: ['email', 'username'] },
          )
          .map((plain) => plainToInstance(RegisterUser, plain)),
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
              email: fc.constant(register.email),
              password: fc.constant(register.password),
              username: fc.oneof(
                fc.nat(),
                fc.constant(''),
                fc.string({ minLength: 31 }),
              ),
            },
            { requiredKeys: ['email', 'password'] },
          )
          .map((plain) => plainToInstance(RegisterUser, plain)),
        async (data) => {
          fc.pre(data.username?.length > 30);
          const errors = await validate(data);

          expect(errors).toHaveLength(1);
          expect(errors[0]).toHaveProperty('property', 'username');
        },
      ),
    );
  });
});
