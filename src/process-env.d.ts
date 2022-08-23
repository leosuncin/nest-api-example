declare namespace NodeJS {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  export interface ProcessEnv {
    readonly PORT: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly DATABASE_URL: string;
    readonly SECRET: string;
  }
}
