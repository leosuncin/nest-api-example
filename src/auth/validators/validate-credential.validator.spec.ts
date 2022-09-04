import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { login as credentials } from '@/auth/fixtures/credentials';
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

  static from(data: object): DTO {
    return Object.assign(new DTO('', ''), data);
  }
}
class Update {
  @ValidateCredential()
  public readonly password: string;

  constructor(password: string, readonly id: string) {
    this.password = password;
  }
}
const user = User.fromPartial({
  id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
  email: 'john@doe.me',
  ...credentials,
  checkPassword(plainPassword: string) {
    return Promise.resolve(plainPassword === this.password);
  },
});

describe('ValidateCredential', () => {
  let mockedUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ValidateCredentialConstraint],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return createMock<Repository<User>>();
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedUserRepository = module.get(getRepositoryToken(User));
  });

  it('should pass with the correct credentials', async () => {
    const dto = new DTO(user.username, user.password);
    mockedUserRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.findOne).toHaveBeenCalledWith({
      where: {
        username: dto.username,
      },
      cache: true,
    });
  });

  it.each([
    {},
    { username: undefined, password: undefined },
    { username: 42, password: false },
    { username: 'jane-doe', password: credentials.password },
    { username: credentials.username, password: 'MiContraseña' },
    { password: credentials.password },
    { username: credentials.username },
    { usuario: credentials.username, contrasena: credentials.password },
  ])('should fail with invalid credentials: %o', async (data) => {
    const dto = DTO.from(data);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should pass with the correct current password', async () => {
    const dto = new Update(user.password, user.id);
    mockedUserRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: dto.id,
      },
      cache: true,
    });
  });

  it('should fail with the incorrect current password', async () => {
    const dto = new Update('ji32k7au4a83', user.id);
    mockedUserRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedUserRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: dto.id,
      },
      cache: true,
    });
  });
});
