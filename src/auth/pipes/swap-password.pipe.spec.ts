import type { ArgumentMetadata } from '@nestjs/common';

import { SwapPasswordPipe } from '@/auth/pipes/swap-password.pipe';
import { credentials } from '@/common/test-helpers';

const value = {
  image: 'https://thispersondoesnotexist.com/image',
  username: 'john',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  email: 'johndoe@example.com',
  newPassword: 'ji32k7au4a83',
  password: credentials.password,
};

describe('StripPasswordPipe', () => {
  it('should be defined', () => {
    expect(new SwapPasswordPipe()).toBeDefined();
  });

  it("should remove the user's password", () => {
    const pipe = new SwapPasswordPipe();
    const value = {
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      password: credentials.password,
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };

    expect(pipe.transform(value, metadata)).not.toHaveProperty('password');
  });

  it('should swap the passwords', () => {
    const pipe = new SwapPasswordPipe();
    const metadata: ArgumentMetadata = {
      type: 'body',
    };
    const result = pipe.transform(value, metadata);

    expect(result).toHaveProperty('password', 'ji32k7au4a83');
    expect(result).not.toHaveProperty('newPassword');
  });

  it('should do nothing to types different than "body"', () => {
    const pipe = new SwapPasswordPipe();
    const metadata: ArgumentMetadata = {
      type: 'custom',
    };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });
});
