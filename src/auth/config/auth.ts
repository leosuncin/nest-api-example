import type { JwtModuleOptions } from '@nestjs/jwt';
import type { CookieOptions } from 'express';
import invariant from 'tiny-invariant';

export type AuthConfig = ReturnType<typeof auth>;

export function auth() {
  invariant(process.env.SECRET, 'SECRET is missing');

  return {
    jwt: {
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '30d',
      },
    } as JwtModuleOptions,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      signed: true,
      secure: process.env.NODE_ENV === 'production',
    } as CookieOptions,
  };
}
