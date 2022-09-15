import { Test } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';

import { AuthenticationService } from '~auth/services/authentication.service';
import {
  IsAlreadyRegister,
  IsAlreadyRegisterConstraint,
} from '~auth/validators/is-already-register.validator';

import { jane, john } from '../fixtures/users';

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
  let mockedAuthenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IsAlreadyRegisterConstraint],
    })
      .useMocker((token) => {
        if (token === AuthenticationService) {
          return createMock<AuthenticationService>();
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedAuthenticationService = module.get(AuthenticationService);
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail(john.email);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'email',
      john.email,
      undefined,
    );
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername(john.username);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'username',
      john.username,
      undefined,
    );
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail(jane.email);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'email',
      jane.email,
      undefined,
    );
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername(jane.username);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'username',
      jane.username,
      undefined,
    );
  });

  it('should pass when the email is not used by another user', async () => {
    const dto = new WithEmail('johndoe@example.com', john.id);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'email',
      'johndoe@example.com',
      dto.id,
    );
  });

  it('should fail when the email is already used by another user', async () => {
    const dto = new WithEmail(jane.email, john.id);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'email',
      jane.email,
      dto.id,
    );
  });

  it('should pass when the username is not used by another user', async () => {
    const dto = new WithUsername('johndoe', john.id);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'username',
      'johndoe',
      dto.id,
    );
  });

  it('should fail when the username is already used by another user', async () => {
    const dto = new WithUsername(jane.username, john.id);

    mockedAuthenticationService.userNotExistWith.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedAuthenticationService.userNotExistWith).toHaveBeenCalledWith(
      'username',
      jane.username,
      dto.id,
    );
  });
});
