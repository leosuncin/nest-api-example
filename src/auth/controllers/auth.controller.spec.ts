import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthController } from '~auth/controllers/auth.controller';
import { type LoginUser } from '~auth/dto/login-user.dto';
import { type RegisterUser } from '~auth/dto/register-user.dto';
import { type UpdateUser } from '~auth/dto/update-user.dto';
import { User } from '~auth/entities/user.entity';
import { login, register } from '~auth/fixtures/credentials';
import { AuthenticationService } from '~auth/services/authentication.service';
import { createMockInstance } from 'jest-create-mock-instance';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        let mock;

        if (token === JwtService) {
          mock = createMockInstance(JwtService);
        }

        if (token === AuthenticationService) {
          mock = createMockInstance(AuthenticationService);
          mock.register.mockImplementation((dto: RegisterUser) =>
            Promise.resolve(
              User.fromPartial({
                ...dto,
                createdAt: new Date(),
                id: '',
                updatedAt: new Date(),
              }),
            ),
          );
          mock.login.mockImplementation((credentials: LoginUser) =>
            Promise.resolve(User.fromPartial(credentials)),
          );
          mock.update.mockImplementation((user: User, changes: UpdateUser) =>
            Promise.resolve(User.fromPartial({ ...user, ...changes })),
          );
        }

        if (token === ConfigService) {
          mock = createMockInstance(ConfigService);
        }

        return mock;
      })
      .compile();

    controller = module.get(AuthController);
    mockAuthenticationService = module.get(AuthenticationService);
  });

  it('should be instanceOf AuthController', () => {
    expect(controller).toBeInstanceOf(AuthController);
  });

  it('should register a new user', async () => {
    await expect(controller.register(register)).resolves.toBeInstanceOf(User);
    expect(mockAuthenticationService.register).toHaveBeenCalledWith(register);
  });

  it('should login an user', async () => {
    await expect(controller.login(login)).resolves.toBeInstanceOf(User);
    expect(mockAuthenticationService.login).toHaveBeenCalledWith(login);
  });

  it('should get the current user', () => {
    const user = User.fromPartial({});

    expect(controller.currentUser(user)).toBe(user);
  });

  it('should update current user data', async () => {
    const user = User.fromPartial({});
    const changes: UpdateUser = {
      bio: 'Aute culpa quis nostrud ipsum.',
      email: 'johndoe@example.com',
      image: 'https://thispersondoesnotexist.com/image',
      newPassword: 'ji32k7au4a83',
      password: login.password,
      username: 'john',
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
