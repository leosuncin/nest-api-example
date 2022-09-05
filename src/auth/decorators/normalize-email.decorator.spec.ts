import { plainToInstance } from 'class-transformer';

import { NormalizeEmail } from '~auth/decorators/normalize-email.decorator';

class Example {
  @NormalizeEmail()
  readonly email!: string;
}

describe('NormalizeEmail', () => {
  it.each([
    ['johndoe@gmail.com', 'johndoe@gmail.com'],
    ['johndoe@googlemail.com', 'johndoe@gmail.com'],
    ['johndoe+foobar@gmail.com', 'johndoe@gmail.com'],
    ['john.doe@gmail.com', 'johndoe@gmail.com'],
    ['john.Doe+any.label@outlook.com', 'john.doe@outlook.com'],
    ['john.doe+foobar@outlook.com', 'john.doe@outlook.com'],
  ])('should remove alias characters, from %s to %s', (email, expected) => {
    const example = plainToInstance(Example, { email });

    expect(example).toHaveProperty('email', expected);
  });
});
