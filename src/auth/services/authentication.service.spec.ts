import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockInstance } from 'jest-create-mock-instance';
import { type FindOptionsWhere, Equal, Not, Repository } from 'typeorm';

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
          const mock = createMockInstance<Repository<User>>(Repository);
          mock.create.mockImplementation((dto) => User.fromPartial(dto));
          mock.save.mockImplementation((entity) =>
            Promise.resolve(
              User.fromPartial({
                ...entity,
                id: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ),
          );
          mock.merge.mockImplementation(Object.assign);

          return mock;
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

  it.each([
    [{ email: user.email }, { email: Equal(user.email) }],
    [{ id: user.id }, { id: Not(user.id) }],
    [{ username: user.username }, { username: Equal(user.username) }],
    [
      { id: user.id, username: 'nostrud' },
      { id: Not(user.id), username: Equal('nostrud') },
    ],
    [
      { id: user.id, email: 'magna@pariatur.do' },
      { id: Not(user.id), email: Equal('magna@pariatur.do') },
    ],
    [
      // eslint-disable-next-line unicorn/no-null
      { email: user.email, username: null, id: undefined },
      { email: Equal(user.email) },
    ],
  ])(
    'should check if it is registered with %j',
    async (partial, where: FindOptionsWhere<User>) => {
      mockedUserRepository.countBy.mockResolvedValueOnce(1);

      // @ts-expect-error mocked value
      await expect(service.isRegistered(partial)).resolves.toBe(true);
      expect(mockedUserRepository.countBy).toHaveBeenCalledWith(where);
    },
  );

  it.each([
    [{ email: 'johndoe@example.com' }, { email: Equal('johndoe@example.com') }],
    [{ username: 'john' }, { username: Equal('john') }],
    [
      { email: 'johndoe@example.com', id: user.id },
      { email: Equal('johndoe@example.com'), id: Not(user.id) },
    ],
    [
      { username: 'john', id: user.id },
      { username: Equal('john'), id: Not(user.id) },
    ],
  ])(
    'should check if it is not registered with %j',
    async (partial, where: FindOptionsWhere<User>) => {
      mockedUserRepository.countBy.mockResolvedValueOnce(0);

      await expect(service.isRegistered(partial)).resolves.toBe(false);
      expect(mockedUserRepository.countBy).toHaveBeenCalledWith(where);
    },
  );

  it.each([
    [credentials, 'username', true],
    [credentials, 'password', true],
    [user, 'username', true],
    [user, 'password', true],
    [{ id: user.id, password: 'password' }, 'password', false],
    [{ username: '' }, 'username', false],
  ])(
    'should verify the credentials %j',
    async (credentials, property, expected) => {
      mockedUserRepository.findOneBy.mockResolvedValueOnce(
        // eslint-disable-next-line unicorn/no-null
        Object.keys(credentials).length > 1 ? user : null,
      );

      await expect(
        // @ts-expect-error mocked value
        service.verifyCredentials(credentials, property),
      ).resolves.toBe(expected);
      expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith(
        'id' in credentials
          ? { id: credentials.id }
          : { username: credentials.username },
      );
    },
  );
});
