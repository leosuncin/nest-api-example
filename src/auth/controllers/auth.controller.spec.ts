import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { type MockProxy, mock } from 'jest-mock-extended';

import { AuthController } from '@/auth/controllers/auth.controller';
import type { RegisterUser } from '@/auth/dto/register-user.dto';
import type { UpdateUser } from '@/auth/dto/update-user.dto';
import { User } from '@/auth/entities/user.entity';
import { AuthenticationService } from '@/auth/services/authentication.service';
import { credentials } from '@/common/test-helpers';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthenticationService: MockProxy<AuthenticationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (Object.is(token, JwtService)) {
          return mock<JwtService>();
        }

        if (Object.is(token, AuthenticationService)) {
          const mockService = mock<AuthenticationService>();

          mockService.register.mockImplementation((dto) =>
            Promise.resolve(
              User.fromPartial({
                ...dto,
                id: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ),
          );
          mockService.login.mockImplementation((credentials) =>
            Promise.resolve(User.fromPartial(credentials)),
          );
          mockService.update.mockImplementation((user, changes) =>
            Promise.resolve(User.fromPartial({ ...user, ...changes })),
          );

          return mockService;
        }
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthenticationService = module.get<
      AuthenticationService,
      MockProxy<AuthenticationService>
    >(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const newUser: RegisterUser = {
      email: 'john@doe.me',
      ...credentials,
    };

    await expect(controller.register(newUser)).resolves.toBeInstanceOf(User);
    expect(mockAuthenticationService.register).toHaveBeenCalledWith(newUser);
  });

  it('should login an user', async () => {
    await expect(controller.login(credentials)).resolves.toBeInstanceOf(User);
    expect(mockAuthenticationService.login).toHaveBeenCalledWith(credentials);
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
      password: credentials.password,
    };

    await expect(controller.updateUser(user, changes)).resolves.toBeInstanceOf(
      User,
    );
    expect(mockAuthenticationService.update).toHaveBeenCalledWith(
      user,
      changes,
    );
  });
});
