import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, mockReset } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import type { RegisterUser } from '@/auth/dto/register-user.dto';
import { User } from '@/auth/entities/user.entity';
import { AuthenticationService } from '@/auth/services/authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const mockRepository = mock<Repository<User>>();

  beforeEach(async () => {
    mockReset(mockRepository);
    mockRepository.create.mockImplementation((dto) => User.fromPartial(dto));
    mockRepository.save.mockImplementation((entity) =>
      Promise.resolve(
        User.fromPartial({
          ...entity,
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        AuthenticationService,
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save the new user when register', async () => {
    const newUser: RegisterUser = {
      email: 'john@doe.me',
      password: 'Th€Pa$$w0rd!',
      username: 'jhon.doe',
    };

    await expect(service.register(newUser)).resolves.toBeInstanceOf(User);
    expect(mockRepository.create).toHaveBeenCalledWith(newUser);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
