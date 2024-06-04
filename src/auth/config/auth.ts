import { type JwtModuleOptions } from '@nestjs/jwt';
import { type CookieOptions } from 'express';
import invariant from 'tiny-invariant';

export type AuthConfig = ReturnType<typeof auth>;

export function auth() {
  invariant(process.env.SECRET, 'SECRET is missing');

  return {
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      signed: true,
    } satisfies CookieOptions,
    jwt: {
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '30d',
      },
    } satisfies JwtModuleOptions,
  };
}
