import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type MockProxy, mock } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import type { RegisterUser } from '@/auth/dto/register-user.dto';
import type { UpdateUser } from '@/auth/dto/update-user.dto';
import { User } from '@/auth/entities/user.entity';
import type { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';
import { AuthenticationService } from '@/auth/services/authentication.service';
import { credentials } from '@/common/test-helpers';

const user = User.fromPartial({
  email: 'john@doe.me',
  ...credentials,
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockRepository: MockProxy<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useFactory: () => {
            const mockRepository = mock<Repository<User>>();

            mockRepository.create.mockImplementation((dto) =>
              User.fromPartial(dto),
            );
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
            mockRepository.merge.mockImplementation((entity, entityLike) =>
              Object.assign(entity, entityLike),
            );

            return mockRepository;
          },
        },
        AuthenticationService,
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    mockRepository = module.get<Repository<User>, MockProxy<Repository<User>>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save the new user when register', async () => {
    const newUser: RegisterUser = {
      email: 'john@doe.me',
      ...credentials,
    };

    await expect(service.register(newUser)).resolves.toBeInstanceOf(User);
    expect(mockRepository.create).toHaveBeenCalledWith(newUser);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should login with an existing user without fail', async () => {
    mockRepository.findOneOrFail.mockResolvedValueOnce(user);

    await expect(service.login(credentials)).resolves.toBeInstanceOf(User);
    expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { username: credentials.username },
    });
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should find a user from the payload', async () => {
    const payload: JwtPayload = {
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + 3600,
    };
    mockRepository.findOne.mockResolvedValueOnce(user);

    await expect(service.verifyPayload(payload)).resolves.toBeInstanceOf(User);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: payload.sub },
    });
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should update a user', async () => {
    const changes: UpdateUser = {
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Aute culpa quis nostrud ipsum.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
      password: credentials.password,
    };

    await expect(service.update(user, changes)).resolves.toBeInstanceOf(User);
    expect(mockRepository.merge).toHaveBeenCalledWith(user, changes);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
