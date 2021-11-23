const isProduction =
  process.argv[1].includes('dist/') || process.env.NODE_ENV === 'production';

/**
 * @type {import('typeorm').ConnectionOptions}
 */
module.exports = {
  type: 'postgres',
  synchronize: false,
  url: process.env.DATABASE_URL,
  entities: isProduction ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isProduction
    ? ['dist/migrations/**/*.js']
    : ['src/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
