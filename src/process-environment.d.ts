declare namespace NodeJS {
  // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/consistent-type-definitions
  export interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT: string;
    readonly SECRET: string;
  }
}
