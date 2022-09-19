import { Test } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';

import { login as credentials } from '~auth/fixtures/credentials';
import { john as user } from '~auth/fixtures/users';
import { AuthenticationService } from '~auth/services/authentication.service';
import {
  ValidateCredential,
  ValidateCredentialConstraint,
} from '~auth/validators/validate-credential.validator';

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

describe('ValidateCredential', () => {
  let mockedAuthenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ValidateCredentialConstraint],
    })
      .useMocker((token) => {
        if (token === AuthenticationService) {
          return createMock<AuthenticationService>({
            verifyCredentials: jest
              .fn()
              .mockImplementation(({ password, username, id }, property) => {
                if (id ? id !== user.id : username !== credentials.username)
                  return false;
                if (property !== 'password') return true;
                return password === credentials.password;
              }),
          });
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedAuthenticationService = module.get(AuthenticationService);
  });

  it.each([credentials, { id: user.id, password: user.password }])(
    'should pass with the correct credentials',
    async (data) => {
      const dto = DTO.from(data);

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(
        mockedAuthenticationService.verifyCredentials,
      ).toHaveBeenNthCalledWith(1, dto, 'username');
      expect(
        mockedAuthenticationService.verifyCredentials,
      ).toHaveBeenNthCalledWith(2, dto, 'password');
    },
  );

  it.each([
    { username: 'jane-doe', password: credentials.password },
    { username: credentials.username, password: 'MiContraseña' },
    { id: user.id, password: 'Anim ex fugiat sunt ut culpa.' },
  ])('should fail with invalid credentials: %o', async (data) => {
    const dto = DTO.from(data);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should pass with the correct current password', async () => {
    const dto = new Update(user.password, user.id);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.verifyCredentials).toHaveBeenCalledWith(
      dto,
      'password',
    );
  });

  it('should fail with the incorrect current password', async () => {
    const dto = new Update('ji32k7au4a83', user.id);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedAuthenticationService.verifyCredentials).toHaveBeenCalledWith(
      dto,
      'password',
    );
  });
});
