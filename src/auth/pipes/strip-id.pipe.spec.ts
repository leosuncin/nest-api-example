import type { ArgumentMetadata } from '@nestjs/common';

import { john as user } from '~auth/fixtures/users';
import { StripIdPipe } from '~auth/pipes/strip-id.pipe';

describe('StripIdPipe', () => {
  it('should be defined', () => {
    expect(new StripIdPipe()).toBeDefined();
  });

  it("should remove the user's id", () => {
    const pipe = new StripIdPipe();
    const value = {
      ...user,
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };

    expect(pipe.transform(value, metadata)).not.toHaveProperty('id');
  });

  it('should do nothing to types different than "body"', () => {
    const pipe = new StripIdPipe();
    const value = {
      id: user.id,
      username: 'john',
      email: 'johndoe@example.com',
    };
    const metadata: ArgumentMetadata = {
      type: 'custom',
    };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });
});
