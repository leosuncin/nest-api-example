import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate } from 'class-validator';
import { mock, mockReset } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import {
  IsAlreadyRegister,
  IsAlreadyRegisterConstraint,
} from '@/auth/validators/is-already-register.validator';

class WithEmail {
  @IsAlreadyRegister()
  readonly email!: string;

  constructor(email: string, readonly id?: string) {
    this.email = email;
  }
}
class WithUsername {
  @IsAlreadyRegister()
  readonly username!: string;

  constructor(username: string, readonly id?: string) {
    this.username = username;
  }
}

describe('IsAlreadyRegister', () => {
  const mockRepository = mock<Repository<User>>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        IsAlreadyRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    mockReset(mockRepository);
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail('john@doe.me');

    mockRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { email: 'john@doe.me' },
    });
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername('john-doe');

    mockRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { username: 'john-doe' },
    });
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail('jane@doe.me');

    mockRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { email: 'jane@doe.me' },
    });
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername('jane.doe');

    mockRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { username: 'jane.doe' },
    });
  });

  it('should pass when the email is not used by another user', async () => {
    const dto = new WithEmail(
      'johndoe@example.com',
      '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
    );

    mockRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { email: 'johndoe@example.com', id: expect.anything() },
    });
  });

  it('should fail when the email is already used by another user', async () => {
    const dto = new WithEmail(
      'jane@doe.me',
      '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
    );

    mockRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { email: 'jane@doe.me', id: expect.anything() },
    });
  });

  it('should pass when the username is not used by another user', async () => {
    const dto = new WithUsername(
      'johndoe',
      '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
    );

    mockRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { username: 'johndoe', id: expect.anything() },
    });
  });

  it('should fail when the username is already used by another user', async () => {
    const dto = new WithUsername(
      'jane-doe',
      '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
    );

    mockRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { username: 'jane-doe', id: expect.anything() },
    });
  });
});
