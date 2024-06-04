import { type User } from '~auth/entities/user.entity';

declare namespace NodeJS {
  // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/consistent-type-definitions
  export interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT: string;
    readonly SECRET: string;
  }
}

declare module 'express' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Request {
    cookies: Record<string, string | null>;
    signedCookies: Record<string, string | null>;
    user: User | undefined;
  }
}
