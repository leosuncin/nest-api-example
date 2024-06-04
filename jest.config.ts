import { compilerOptions } from './tsconfig.json';
import { pathsToModuleNameMapper } from 'ts-jest';

export default {
  projects: [
    {
      displayName: 'Unit test',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      preset: 'ts-jest',
      rootDir: 'src',
      setupFilesAfterEnv: ['dotenv/config'],
      testEnvironment: 'node',
      testRegex: '\\.spec\\.ts$',
    },
    {
      displayName: 'E2E test',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      preset: 'ts-jest',
      rootDir: 'test',
      setupFilesAfterEnv: ['dotenv/config'],
      testEnvironment: 'node',
      testRegex: '\\.end2end.spec\\.ts$',
    },
  ],
};
