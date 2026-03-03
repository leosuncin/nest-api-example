import { readFileSync } from 'node:fs';
import { pathsToModuleNameMapper } from 'ts-jest';

const { compilerOptions } = JSON.parse(
  readFileSync('./tsconfig.json', { encoding: 'utf8' }),
);

export default {
  projects: [
    {
      displayName: 'Unit test',
      moduleDirectories: ['node_modules', process.cwd()],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      preset: 'ts-jest',
      rootDir: 'src',
      setupFilesAfterEnv: ['dotenv/config'],
      testEnvironment: 'node',
      testRegex: '\\.spec\\.ts$',
    },
    {
      displayName: 'E2E test',
      moduleDirectories: ['node_modules', process.cwd()],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      preset: 'ts-jest',
      rootDir: 'test',
      setupFilesAfterEnv: ['dotenv/config'],
      testEnvironment: 'node',
      testRegex: '\\.end2end.spec\\.ts$',
    },
  ],
};
