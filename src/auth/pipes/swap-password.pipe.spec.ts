import { type ArgumentMetadata } from '@nestjs/common';
import { login as credentials } from '~auth/fixtures/credentials';
import { SwapPasswordPipe } from '~auth/pipes/swap-password.pipe';

describe('StripPasswordPipe', () => {
  it('should be defined', () => {
    expect(new SwapPasswordPipe()).toBeDefined();
  });

  it("should remove the user's password", () => {
    const pipe = new SwapPasswordPipe();
    const value = {
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      image: 'https://thispersondoesnotexist.com/image',
      password: credentials.password,
      username: 'john',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };

    expect(pipe.transform(value, metadata)).not.toHaveProperty('password');
  });

  it('should swap the passwords', () => {
    const pipe = new SwapPasswordPipe();
    const value = {
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      image: 'https://thispersondoesnotexist.com/image',
      newPassword: 'ji32k7au4a83',
      password: credentials.password,
      username: 'john',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };
    const result = pipe.transform(value, metadata);

    expect(result).toHaveProperty('password', 'ji32k7au4a83');
    expect(result).not.toHaveProperty('newPassword');
  });

  it('should do nothing to types different than "body"', () => {
    const pipe = new SwapPasswordPipe();
    const value = {
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      image: 'https://thispersondoesnotexist.com/image',
      newPassword: 'ji32k7au4a83',
      password: credentials.password,
      username: 'john',
    };
    const metadata: ArgumentMetadata = {
      type: 'custom',
    };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });
});
