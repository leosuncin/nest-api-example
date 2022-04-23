import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import { mock, mockReset } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import {
  ValidateCredential,
  ValidateCredentialConstraint,
} from '@/auth/validators/validate-credential.validator';

class DTO {
  @ValidateCredential()
  public readonly username: string;

  @ValidateCredential()
  public readonly password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
const user = User.fromPartial({
  email: 'john@doe.me',
  password: 'Th€Pa$$w0rd!',
  username: 'john-doe',
  checkPassword(plainPassword) {
    return Promise.resolve(plainPassword === this.password);
  },
});

describe('ValidateCredential', () => {
  const mockRepository = mock<Repository<User>>({
    findOne: (condition) =>
      Promise.resolve(
        condition &&
          typeof condition === 'object' &&
          'username' in condition &&
          condition.username === user.username
          ? user
          : undefined,
      ),
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        ValidateCredentialConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  afterEach(() => {
    mockReset(mockRepository);
  });

  it('should pass with the correct credentials', async () => {
    const dto = new DTO(user.username, user.password);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it.each([
    {},
    { username: undefined, password: undefined },
    { username: 42, password: false },
    { username: 'jane-doe', password: 'Th€Pa$$w0rd!' },
    { username: 'john-doe', password: 'MiContraseña' },
    { password: 'Th€Pa$$w0rd!' },
    { username: 'john-doe' },
    { usuario: 'john-doe', contraseña: 'Th€Pa$$w0rd!' },
  ])('should fail with invalid credentials: %o', async (data) => {
    const dto = plainToInstance(DTO, data);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
