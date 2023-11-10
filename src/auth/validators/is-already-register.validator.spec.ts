import { Test } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';
import { createMockInstance } from 'jest-create-mock-instance';

import { jane, john } from '~auth/fixtures/users';
import { AuthenticationService } from '~auth/services/authentication.service';
import {
  IsAlreadyRegister,
  IsAlreadyRegisterConstraint,
} from '~auth/validators/is-already-register.validator';

class WithEmail {
  @IsAlreadyRegister()
  readonly email!: string;

  constructor(
    email: string,
    readonly id?: string,
  ) {
    this.email = email;
  }
}
class WithUsername {
  @IsAlreadyRegister()
  readonly username!: string;

  constructor(
    username: string,
    readonly id?: string,
  ) {
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
          return createMockInstance(AuthenticationService);
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedAuthenticationService = module.get(AuthenticationService);
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail(john.email);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      email: john.email,
      id: undefined,
    });
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername(john.username);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      username: john.username,
      undefined,
    });
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail(jane.email);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      email: jane.email,
      id: undefined,
    });
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername(jane.username);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      username: jane.username,
      id: undefined,
    });
  });

  it('should pass when the email is not used by another user', async () => {
    const dto = new WithEmail('johndoe@example.com', john.id);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      email: 'johndoe@example.com',
      id: dto.id,
    });
  });

  it('should fail when the email is already used by another user', async () => {
    const dto = new WithEmail(jane.email, john.id);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      email: jane.email,
      id: dto.id,
    });
  });

  it('should pass when the username is not used by another user', async () => {
    const dto = new WithUsername('johndoe', john.id);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      username: 'johndoe',
      id: dto.id,
    });
  });

  it('should fail when the username is already used by another user', async () => {
    const dto = new WithUsername(jane.username, john.id);

    mockedAuthenticationService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedAuthenticationService.isRegistered).toHaveBeenCalledWith({
      username: jane.username,
      id: dto.id,
    });
  });
});
