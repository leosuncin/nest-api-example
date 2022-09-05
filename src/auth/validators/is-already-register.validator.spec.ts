import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';
import { Equal, Not } from 'typeorm';

import { User } from '~auth/entities/user.entity';
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
  let mockedUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IsAlreadyRegisterConstraint],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return createMock<Repository<User>>();
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedUserRepository = module.get(getRepositoryToken(User));
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail(john.email);

    mockedUserRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { email: Equal(john.email) },
    });
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername(john.username);

    mockedUserRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { username: Equal(john.username) },
    });
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail(jane.email);

    mockedUserRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { email: Equal(jane.email) },
    });
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername(jane.username);

    mockedUserRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { username: Equal(jane.username) },
    });
  });

  it('should pass when the email is not used by another user', async () => {
    const dto = new WithEmail('johndoe@example.com', john.id);

    mockedUserRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { email: Equal('johndoe@example.com'), id: Not(dto.id) },
    });
  });

  it('should fail when the email is already used by another user', async () => {
    const dto = new WithEmail(jane.email, john.id);

    mockedUserRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { email: Equal(jane.email), id: Not(dto.id) },
    });
  });

  it('should pass when the username is not used by another user', async () => {
    const dto = new WithUsername('johndoe', john.id);

    mockedUserRepository.count.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { username: Equal('johndoe'), id: Not(dto.id) },
    });
  });

  it('should fail when the username is already used by another user', async () => {
    const dto = new WithUsername(jane.username, john.id);

    mockedUserRepository.count.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(mockedUserRepository.count).toHaveBeenCalledWith({
      where: { username: Equal(jane.username), id: Not(dto.id) },
    });
  });
});
