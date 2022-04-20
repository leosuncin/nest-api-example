import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate } from 'class-validator';
import { anyObject, mock, MockProxy } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import {
  IsAlreadyRegister,
  IsAlreadyRegisterConstraint,
} from '@/auth/validators/is-already-register.validator';

describe('IsAlreadyRegister', () => {
  const user = User.fromPartial({
    id: '',
    email: 'john@doe.me',
    password: 'Th€Pa$$w0rd!',
    username: 'john_doe',
    bio: '',
    image: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  let mockRepository: MockProxy<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
        IsAlreadyRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    mockRepository = module.get<Repository<User>, MockProxy<Repository<User>>>(
      getRepositoryToken(User),
    );
  });

  it('should validate when the user already exists with email', async () => {
    class DTO {
      @IsAlreadyRegister()
      readonly email!: string;

      constructor(email: string) {
        this.email = email;
      }
    }
    const dto = new DTO(user.email);

    mockRepository.count
      .calledWith(anyObject({ email: user.email }))
      .mockResolvedValue(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
  });

  it('should validate when the user already exists with username', async () => {
    class DTO {
      @IsAlreadyRegister()
      readonly username!: string;

      constructor(username: string) {
        this.username = username;
      }
    }
    const dto = new DTO(user.username);

    mockRepository.count
      .calledWith(anyObject({ username: user.username }))
      .mockResolvedValue(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
  });

  it('should validate when the user not exists with email', async () => {
    class DTO {
      @IsAlreadyRegister()
      readonly email!: string;

      constructor(email: string) {
        this.email = email;
      }
    }
    const dto = new DTO('jane@doe.me');

    mockRepository.count.calledWith(anyObject()).mockResolvedValue(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate when the user not exists with username', async () => {
    class DTO {
      @IsAlreadyRegister()
      readonly username!: string;

      constructor(username: string) {
        this.username = username;
      }
    }
    const dto = new DTO('jane_doe');

    mockRepository.count.calledWith(anyObject()).mockResolvedValue(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
