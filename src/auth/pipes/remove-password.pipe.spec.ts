import { ArgumentMetadata } from '@nestjs/common';

import { RemovePasswordPipe } from '@/auth/pipes/remove-password.pipe';

describe('StripPasswordPipe', () => {
  it('should be defined', () => {
    expect(new RemovePasswordPipe()).toBeDefined();
  });

  it("should remove the user's password", () => {
    const pipe = new RemovePasswordPipe();
    const value = {
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
      password: 'Th€Pa$$w0rd!',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };

    expect(pipe.transform(value, metadata)).not.toHaveProperty('password');
  });

  it('should do nothing to types different than "body"', () => {
    const pipe = new RemovePasswordPipe();
    const value = {
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
      password: 'Th€Pa$$w0rd!',
    };
    const metadata: ArgumentMetadata = {
      type: 'custom',
    };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });
});
