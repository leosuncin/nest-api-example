import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { mock, mockReset } from 'jest-mock-extended';
import nock, { cleanAll, enableNetConnect } from 'nock';
import { Repository } from 'typeorm';

import { UpdateUser } from '@/auth/dto/update-user.dto';
import { User } from '@/auth/entities/user.entity';
import { updateFixture } from '@/auth/fixtures/auth.fixture';
import { IsAlreadyRegisterConstraint } from '@/auth/validators/is-already-register.validator';
import { ValidateCredentialConstraint } from '@/auth/validators/validate-credential.validator';
import { credentials, PASSWORD_HASHES } from '@/common/test-helpers';

describe('Update user validations', () => {
  const mockUserRepository = mock<Repository<User>>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        IsAlreadyRegisterConstraint,
        ValidateCredentialConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });

    nock('https://api.pwnedpasswords.com')
      .persist()
      .replyDate()
      .get(/range\/\w{5}/)
      .reply(HttpStatus.OK, PASSWORD_HASHES);
  });

  beforeEach(() => {
    mockReset(mockUserRepository);
  });

  afterAll(() => {
    cleanAll();
    enableNetConnect();
  });

  it('should pass with valid data', async () => {
    mockUserRepository.count.mockResolvedValue(0);
    mockUserRepository.findOne.mockResolvedValue(
      User.fromPartial({ checkPassword: () => Promise.resolve(true) }),
    );

    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed) =>
            updateFixture({
              password: credentials.password,
              id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
            }).execute({
              faker: { seed },
            }),
          ),
        async (data) => {
          await expect(validate(await data)).resolves.toHaveLength(0);
        },
      ),
    );
  });

  it('should validate the email', async () => {
    mockUserRepository.count.mockResolvedValue(1);

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.string(), fc.integer()).map((email) =>
          plainToInstance(UpdateUser, {
            email,
            id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
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
    mockUserRepository.count.mockResolvedValue(1);

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.integer(), fc.string({ minLength: 30 })).map((username) =>
          plainToInstance(UpdateUser, {
            username,
            id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
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
    mockUserRepository.findOne.mockResolvedValue(
      User.fromPartial({ checkPassword: () => Promise.resolve(false) }),
    );

    const errors = await validate(
      plainToInstance(UpdateUser, {
        /* cspell:disable-next-line */
        newPassword: 'T??3Pa55w??rd?',
        id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
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
