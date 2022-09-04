import type { ArgumentMetadata } from '@nestjs/common';

import { StripIdPipe } from '@/auth/pipes/strip-id.pipe';
import { credentials } from '@/common/fixtures/credentials';

describe('StripIdPipe', () => {
  it('should be defined', () => {
    expect(new StripIdPipe()).toBeDefined();
  });

  it("should remove the user's id", () => {
    const pipe = new StripIdPipe();
    const value = {
      id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
      image: 'https://thispersondoesnotexist.com/image',
      username: 'john',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      email: 'johndoe@example.com',
      newPassword: 'ji32k7au4a83',
      password: credentials.password,
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
    };

    expect(pipe.transform(value, metadata)).not.toHaveProperty('id');
  });

  it('should do nothing to types different than "body"', () => {
    const pipe = new StripIdPipe();
    const value = {
      id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
      username: 'john',
      email: 'johndoe@example.com',
    };
    const metadata: ArgumentMetadata = {
      type: 'custom',
    };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });
});
