import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate } from 'class-validator';
import { anyObject, mock, mockReset } from 'jest-mock-extended';
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
  password: 'Th€Pa$$w0rd!',
  username: 'john-doe',
  checkPassword(plainPassword) {
    return Promise.resolve(plainPassword === this.password);
  },
});

describe('ValidateCredential', () => {
  const mockRepository = mock<Repository<User>>();

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
    mockReset(mockRepository);
  });

  it('should pass with the correct credentials', async () => {
    const dto = new DTO(user.username, user.password);
    mockRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.findOne).toHaveBeenCalledWith(
      { username: dto.username },
      anyObject(),
    );
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
    const dto = DTO.from(data);
    mockRepository.findOne.mockResolvedValue(void 0);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should pass with the correct current password', async () => {
    const dto = new Update(user.password, user.id);
    mockRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.findOne).toHaveBeenCalledWith(
      { id: dto.id },
      anyObject(),
    );
  });

  it('should fail with the incorrect current password', async () => {
    const dto = new Update('ji32k7au4a83', user.id);
    mockRepository.findOne.mockResolvedValue(user);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockRepository.findOne).toHaveBeenCalledWith(
      { id: dto.id },
      anyObject(),
    );
  });
});
