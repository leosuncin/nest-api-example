import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '@/auth/controllers/auth.controller';
import type { LoginUser } from '@/auth/dto/login-user.dto';
import type { RegisterUser } from '@/auth/dto/register-user.dto';
import type { UpdateUser } from '@/auth/dto/update-user.dto';
import { User } from '@/auth/entities/user.entity';
import { AuthenticationService } from '@/auth/services/authentication.service';

jest.mock('@/auth/services/authentication.service', () => ({
  AuthenticationService: function () {
    return {
      register: jest.fn().mockImplementation((dto: RegisterUser) =>
        Promise.resolve(
          User.fromPartial({
            ...dto,
            id: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      ),
      login: jest
        .fn()
        .mockImplementation((credentials: LoginUser) =>
          Promise.resolve(User.fromPartial(credentials)),
        ),
      update: jest
        .fn()
        .mockImplementation((user: User, changes: UpdateUser) =>
          Promise.resolve(User.fromPartial({ ...user, ...changes })),
        ),
    };
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: JwtService,
          useValue: {},
        },
        AuthenticationService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<
      AuthenticationService,
      jest.Mocked<AuthenticationService>
    >(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const newUser: RegisterUser = {
      email: 'john@doe.me',
      password: 'Th€Pa$$w0rd!',
      username: 'jhon.doe',
    };

    await expect(controller.register(newUser)).resolves.toBeInstanceOf(User);
    expect(service.register).toHaveBeenCalledWith(newUser);
  });

  it('should login an user', async () => {
    const credentials: LoginUser = {
      password: 'Th€Pa$$w0rd!',
      username: 'jhon-doe',
    };

    await expect(controller.login(credentials)).resolves.toBeInstanceOf(User);
    expect(service.login).toHaveBeenCalledWith(credentials);
  });

  it('should get the current user', () => {
    const user = User.fromPartial({});

    expect(controller.currentUser(user)).toBe(user);
  });

  it('should update current user data', async () => {
    const user = User.fromPartial({});
    const changes: UpdateUser = {
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Aute culpa quis nostrud ipsum.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
      password: 'Th€Pa$$w0rd!',
    };

    await expect(controller.updateUser(user, changes)).resolves.toBeInstanceOf(
      User,
    );
    expect(service.update).toHaveBeenCalledWith(user, changes);
  });
});
