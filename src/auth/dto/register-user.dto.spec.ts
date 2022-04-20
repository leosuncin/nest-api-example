import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import faker from 'faker';
import fc from 'fast-check';

import { RegisterUser } from '@/auth/dto/register-user.dto';
import { User } from '@/auth/entities/user.entity';
import { IsAlreadyRegisterConstraint } from '@/auth/validators/is-already-register.validator';

describe('Register user validations', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: () => Promise.resolve(0),
          },
        },
        IsAlreadyRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed): RegisterUser => {
            faker.seed(seed);

            return plainToInstance(RegisterUser, {
              email: faker.internet.email(),
              password: faker.internet.password(),
              username: faker.internet.userName(),
            });
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
              password: fc.constant('ThePassword!'),
              username: fc.constant('john.doe'),
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
              email: fc.constant('john@doe.me'),
              password: fc.oneof(
                fc.nat(),
                fc.string({ maxLength: 7 }),
                fc.string({ minLength: 31 }),
              ),
              username: fc.constant('john.doe'),
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
              email: fc.constant('john@doe.me'),
              password: fc.constant('ThePassword!'),
              username: fc.oneof(
                fc.nat(),
                fc.string().filter((string) => !/^[\w.-]+$/i.test(string)),
                fc.string({ minLength: 31 }),
              ),
            },
            { requiredKeys: ['email', 'password'] },
          )
          .map((plain) => plainToInstance(RegisterUser, plain)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(1);
          expect(errors[0]).toHaveProperty('property', 'username');
        },
      ),
    );
  });
});
