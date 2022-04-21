import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

export default {
  projects: [
    {
      displayName: 'Unit test',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'src',
      testRegex: '\\.spec\\.ts$',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      setupFilesAfterEnv: ['dotenv/config'],
    },
    {
      displayName: 'E2E test',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'test',
      testRegex: '\\.e2e-spec\\.ts$',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      setupFilesAfterEnv: ['dotenv/config'],
      globalSetup: '<rootDir>/global-setup.ts',
      globalTeardown: '<rootDir>/global-teardown.ts',
    },
  ],
};
