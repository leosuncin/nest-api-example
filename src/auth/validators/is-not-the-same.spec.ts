import { validateSync } from 'class-validator';

import { IsNotTheSame } from '@/auth/validators/is-not-the-same';

describe('IsNotTheSame', () => {
  class DTO {
    readonly username!: string;

    @IsNotTheSame<DTO>('username')
    readonly password: string;

    constructor(username: string, password: string) {
      this.username = username;
      this.password = password;
    }
  }

  it("should pass when property's values are different", () => {
    const dto = new DTO('john_doe', 'Th€Pa$$w0rd!');

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it("should fail when property's values are equals", () => {
    const dto = new DTO('john_doe', 'john_doe');

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]!.constraints).toMatchObject({
      isNotTheSame: 'password must be different than username',
    });
  });
});
