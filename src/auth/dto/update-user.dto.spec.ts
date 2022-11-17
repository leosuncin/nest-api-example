import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMockInstance } from 'jest-create-mock-instance';
import nock, { cleanAll, enableNetConnect } from 'nock';

import { UpdateUser } from '~auth/dto/update-user.dto';
import { updateUserFactory } from '~auth/factories/update-user.factory';
import { PASSWORD_HASHES } from '~auth/fixtures/password-hashes';
import { john as user } from '~auth/fixtures/users';
import { AuthenticationService } from '~auth/services/authentication.service';
import { IsAlreadyRegisterConstraint } from '~auth/validators/is-already-register.validator';
import { ValidateCredentialConstraint } from '~auth/validators/validate-credential.validator';

jest.setTimeout(7e3);

describe('Update user validations', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IsAlreadyRegisterConstraint, ValidateCredentialConstraint],
    })
      .useMocker((token) => {
        if (token === AuthenticationService) {
          const mock = createMockInstance(AuthenticationService);
          mock.isRegistered.mockResolvedValue(false);
          mock.verifyCredentials.mockResolvedValue(true);

          return mock;
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });

    nock('https://api.pwnedpasswords.com')
      .persist()
      .replyDate()
      .get(/range\/\w{5}/)
      .reply(HttpStatus.OK, PASSWORD_HASHES);
  });

  afterAll(() => {
    cleanAll();
    enableNetConnect();
  });

  it('should pass with valid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed) => {
            faker.seed(seed);

            return updateUserFactory.buildOne({
              password: user.password,
              id: user.id,
            });
          }),
        async (data) => {
          await expect(validate(data)).resolves.toHaveLength(0);
        },
      ),
    );
  });

  it('should validate the email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.string(), fc.integer()).map((email) =>
          plainToInstance(UpdateUser, {
            email,
            id: user.id,
          }),
        ),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.every((error) => error.property === 'email')).toBe(
            true,
          );
        },
      ),
    );
  });

  it('should validate the username', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.integer(), fc.string({ minLength: 31 })).map((username) =>
          plainToInstance(UpdateUser, {
            username,
            id: user.id,
          }),
        ),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.every((error) => error.property === 'username')).toBe(
            true,
          );
        },
      ),
    );
  });

  it('should validate that new password requires the current password', async () => {
    const errors = await validate(
      plainToInstance(UpdateUser, {
        /* cspell:disable-next-line */
        newPassword: 'Tλ3Pa55wθrd?',
        id: user.id,
      }),
    );

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.every((error) => error.property === 'password')).toBe(true);
  });

  it('should validate the image', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .oneof(
            fc.integer(),
            fc.string(),
            fc.webUrl({ validSchemes: ['ftp'], withFragments: true }),
          )
          .map((image) => plainToInstance(UpdateUser, { image })),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.every((error) => error.property === 'image')).toBe(
            true,
          );
        },
      ),
    );
  });

  it('should validate the bio', async () => {
    const errors = await validate(plainToInstance(UpdateUser, { bio: '' }));

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.every((error) => error.property === 'bio')).toBe(true);
  });
});
