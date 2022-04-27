import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import fc from 'fast-check';

import { UpdateUser } from '@/auth/dto/update-user.dto';
import { updateFixture } from '@/auth/fixtures/auth.fixture';

describe('Update user validations', () => {
  it('should pass with valid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .integer()
          .noBias()
          .noShrink()
          .map((seed) =>
            updateFixture({ password: 'Th€Pa$$w0rd!' }).execute({
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
    await fc.assert(
      fc.asyncProperty(
        fc
          .oneof(fc.string(), fc.integer())
          .map((email) => plainToInstance(UpdateUser, { email })),
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
        fc
          .oneof(fc.integer(), fc.string({ minLength: 30 }))
          .map((username) => plainToInstance(UpdateUser, { username })),
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
      plainToInstance(UpdateUser, { newPassword: 'Tλ3Pa55wθrd?' }),
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
