import { Test } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';

import { login as credentials } from '~auth/fixtures/credentials';
import {
  type hasPasswordBeenPwned,
  PWNED_PASSWORD,
} from '~auth/providers/pwned-password.provider';
import {
  IsNotVulnerable,
  IsNotVulnerableConstraint,
} from '~auth/validators/is-not-vulnerable.validator';

class DTO {
  @IsNotVulnerable()
  readonly password: string;

  constructor(password: string) {
    this.password = password;
  }
}

describe('IsNotVulnerablePassword', () => {
  let pwnedPassword: jest.MockedFunction<typeof hasPasswordBeenPwned>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: PWNED_PASSWORD,
          useValue: jest.fn(),
        },
        IsNotVulnerableConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    pwnedPassword = module.get(PWNED_PASSWORD);
  });

  it('should check if the password is insecure when it has been exposed', async () => {
    const dto = new DTO('password');

    pwnedPassword.mockResolvedValueOnce(100);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });

  it('should check if the password is secure when it has never been exposed', async () => {
    const dto = new DTO(credentials.password);

    pwnedPassword.mockResolvedValueOnce(0);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
