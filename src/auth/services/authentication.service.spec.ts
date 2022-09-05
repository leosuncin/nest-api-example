import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';

import type { UpdateUser } from '~auth/dto/update-user.dto';
import { User } from '~auth/entities/user.entity';
import {
  login as credentials,
  register as newUser,
} from '~auth/fixtures/credentials';
import { john as user } from '~auth/fixtures/users';
import type { JwtPayload } from '~auth/interfaces/jwt-payload.interface';
import { AuthenticationService } from '~auth/services/authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockedUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthenticationService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return createMock<Repository<User>>({
            create: jest
              .fn()
              .mockImplementation((dto: Partial<User>) =>
                User.fromPartial(dto),
              ),
            save: jest.fn().mockImplementation((entity: User) =>
              Promise.resolve(
                User.fromPartial({
                  ...entity,
                  id: '',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }),
              ),
            ),
            merge: jest.fn().mockImplementation(Object.assign),
          });
        }

        return;
      })
      .compile();

    service = module.get(AuthenticationService);
    mockedUserRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save the new user when register', async () => {
    await expect(service.register(newUser)).resolves.toBeInstanceOf(User);
    expect(mockedUserRepository.create).toHaveBeenCalledWith(newUser);
    expect(mockedUserRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should login with an existing user without fail', async () => {
    mockedUserRepository.findOneOrFail.mockResolvedValueOnce(user);

    await expect(service.login(credentials)).resolves.toBeInstanceOf(User);
    expect(mockedUserRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { username: credentials.username },
    });
    expect(mockedUserRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should find a user from the payload', async () => {
    const payload: JwtPayload = {
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + 3600,
    };
    mockedUserRepository.findOne.mockResolvedValueOnce(user);

    await expect(service.verifyPayload(payload)).resolves.toBeInstanceOf(User);
    expect(mockedUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: payload.sub },
    });
    expect(mockedUserRepository.findOne).toHaveBeenCalledTimes(1);
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
    expect(mockedUserRepository.merge).toHaveBeenCalledWith(user, changes);
    expect(mockedUserRepository.save).toHaveBeenCalledTimes(1);
  });
});
